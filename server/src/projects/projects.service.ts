import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, ProjectPriority } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

interface MemoryProject {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  priority: ProjectPriority;
  dueDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private memoryProjects = new Map<string, MemoryProject>();

  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(dto: CreateProjectDto, userId: string): Promise<any> {
    const validUserId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId();
    const newProjectId = new Types.ObjectId();

    const memProject: MemoryProject = {
      _id: newProjectId,
      name: dto.name,
      description: dto.description || '',
      priority: dto.priority || ProjectPriority.NONE,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      createdBy: validUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const project = await this.projectModel.create({
        ...dto,
        createdBy: validUserId,
      });
      const p = project as any;
      this.memoryProjects.set(p._id.toString(), {
        _id: p._id,
        name: p.name,
        description: p.description,
        priority: p.priority,
        dueDate: p.dueDate,
        createdBy: p.createdBy,
        createdAt: p.createdAt || new Date(),
        updatedAt: p.updatedAt || new Date(),
      });
      return project;
    } catch (err) {
      this.logger.warn(`Database project creation fallback to in-memory: ${(err as Error).message}`);
      this.memoryProjects.set(newProjectId.toString(), memProject);
      return memProject;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const projects = await this.projectModel
        .find()
        .populate('lead', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .sort({ createdAt: -1 })
        .exec();

      projects.forEach((doc) => {
        const p = doc as any;
        this.memoryProjects.set(p._id.toString(), {
          _id: p._id,
          name: p.name,
          description: p.description,
          priority: p.priority,
          dueDate: p.dueDate,
          createdBy: p.createdBy,
          createdAt: p.createdAt || new Date(),
          updatedAt: p.updatedAt || new Date(),
        });
      });

      return projects;
    } catch (err) {
      this.logger.warn(`Database project findAll fallback to in-memory: ${(err as Error).message}`);
      return Array.from(this.memoryProjects.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const project = await this.projectModel
        .findById(id)
        .populate('lead', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .populate('createdBy', 'fullName avatar')
        .exec();

      if (project) return project;
    } catch (err) {
      this.logger.warn(`Database project findOne fallback to in-memory: ${(err as Error).message}`);
    }

    const memProject = this.memoryProjects.get(id);
    if (!memProject) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return memProject;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<any> {
    try {
      const project = await this.projectModel
        .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
        .populate('lead', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .exec();

      if (project) {
        const p = project as any;
        this.memoryProjects.set(id, {
          _id: p._id,
          name: p.name,
          description: p.description,
          priority: p.priority,
          dueDate: p.dueDate,
          createdBy: p.createdBy,
          createdAt: p.createdAt || new Date(),
          updatedAt: new Date(),
        });
        return project;
      }
    } catch (err) {
      this.logger.warn(`Database project update fallback to in-memory: ${(err as Error).message}`);
    }

    const memProject = this.memoryProjects.get(id);
    if (!memProject) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    Object.assign(memProject, dto, { updatedAt: new Date() });
    this.memoryProjects.set(id, memProject);
    return memProject;
  }

  async remove(id: string): Promise<void> {
    try {
      await this.projectModel.findByIdAndDelete(id);
    } catch (err) {
      this.logger.warn(`Database project remove fallback to in-memory: ${(err as Error).message}`);
    }
    this.memoryProjects.delete(id);
  }
}
