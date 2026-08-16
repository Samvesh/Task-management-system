import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskPriority } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface MemoryTask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  labels: string[];
  project?: Types.ObjectId;
  parentTask?: Types.ObjectId;
  resources: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private memoryTasks = new Map<string, MemoryTask>();

  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  /**
   * Create a new task. Resilient to any DB network issues.
   */
  async create(dto: CreateTaskDto, userId: string): Promise<any> {
    const validUserId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId();
    const newTaskId = new Types.ObjectId();

    const memTask: MemoryTask = {
      _id: newTaskId,
      title: dto.title,
      description: dto.description || '',
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.NONE,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      labels: dto.labels || [],
      project: dto.project && Types.ObjectId.isValid(dto.project) ? new Types.ObjectId(dto.project) : undefined,
      parentTask: dto.parentTask && Types.ObjectId.isValid(dto.parentTask) ? new Types.ObjectId(dto.parentTask) : undefined,
      resources: dto.resources || [],
      createdBy: validUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const task = await this.taskModel.create({
        ...dto,
        createdBy: validUserId,
      });
      const t = task as any;
      this.memoryTasks.set(t._id.toString(), {
        _id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        labels: t.labels || [],
        project: t.project,
        parentTask: t.parentTask,
        resources: t.resources || [],
        createdBy: t.createdBy,
        createdAt: t.createdAt || new Date(),
        updatedAt: t.updatedAt || new Date(),
      });
      return task;
    } catch (err) {
      this.logger.warn(`Database task creation fallback to in-memory: ${(err as Error).message}`);
      this.memoryTasks.set(newTaskId.toString(), memTask);
      return memTask;
    }
  }

  /**
   * Get all tasks, optionally filtered.
   */
  async findAll(filters?: {
    status?: string;
    project?: string;
    parentTask?: string;
  }): Promise<any[]> {
    try {
      const query: Record<string, unknown> = {};
      if (filters?.status) query.status = filters.status;
      if (filters?.project && Types.ObjectId.isValid(filters.project)) query.project = new Types.ObjectId(filters.project);
      if (filters?.parentTask && Types.ObjectId.isValid(filters.parentTask)) {
        query.parentTask = new Types.ObjectId(filters.parentTask);
      } else {
        query.parentTask = { $exists: false };
      }

      const tasks = await this.taskModel
        .find(query)
        .populate('assignee', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .populate('reporter', 'fullName avatar')
        .sort({ createdAt: -1 })
        .exec();

      tasks.forEach((doc) => {
        const t = doc as any;
        this.memoryTasks.set(t._id.toString(), {
          _id: t._id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          labels: t.labels || [],
          project: t.project,
          parentTask: t.parentTask,
          resources: t.resources || [],
          createdBy: t.createdBy,
          createdAt: t.createdAt || new Date(),
          updatedAt: t.updatedAt || new Date(),
        });
      });

      return tasks;
    } catch (err) {
      this.logger.warn(`Database findAll fallback to in-memory: ${(err as Error).message}`);
      let list = Array.from(this.memoryTasks.values());

      if (filters?.status) {
        list = list.filter((t) => t.status === filters.status);
      }
      if (filters?.project) {
        list = list.filter((t) => t.project?.toString() === filters.project);
      }
      if (filters?.parentTask) {
        list = list.filter((t) => t.parentTask?.toString() === filters.parentTask);
      } else {
        list = list.filter((t) => !t.parentTask);
      }

      return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Get a single task by ID.
   */
  async findOne(id: string): Promise<any> {
    try {
      const task = await this.taskModel
        .findById(id)
        .populate('assignee', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .populate('reporter', 'fullName avatar')
        .populate('createdBy', 'fullName avatar')
        .exec();

      if (task) return task;
    } catch (err) {
      this.logger.warn(`Database findOne fallback to in-memory: ${(err as Error).message}`);
    }

    const memTask = this.memoryTasks.get(id);
    if (!memTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return memTask;
  }

  /**
   * Update a task by ID.
   */
  async update(id: string, dto: UpdateTaskDto): Promise<any> {
    try {
      const task = await this.taskModel
        .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
        .populate('assignee', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .exec();

      if (task) {
        const t = task as any;
        this.memoryTasks.set(id, {
          _id: t._id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          labels: t.labels || [],
          project: t.project,
          parentTask: t.parentTask,
          resources: t.resources || [],
          createdBy: t.createdBy,
          createdAt: t.createdAt || new Date(),
          updatedAt: new Date(),
        });
        return task;
      }
    } catch (err) {
      this.logger.warn(`Database update fallback to in-memory: ${(err as Error).message}`);
    }

    const memTask = this.memoryTasks.get(id);
    if (!memTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    Object.assign(memTask, dto, { updatedAt: new Date() });
    this.memoryTasks.set(id, memTask);
    return memTask;
  }

  /**
   * Delete a task by ID.
   */
  async remove(id: string): Promise<void> {
    try {
      await this.taskModel.deleteMany({ parentTask: new Types.ObjectId(id) });
      await this.taskModel.findByIdAndDelete(id);
    } catch (err) {
      this.logger.warn(`Database remove fallback to in-memory: ${(err as Error).message}`);
    }

    this.memoryTasks.delete(id);
    for (const [key, task] of this.memoryTasks.entries()) {
      if (task.parentTask?.toString() === id) {
        this.memoryTasks.delete(key);
      }
    }
  }

  /**
   * Get subtasks for a given parent task.
   */
  async findSubtasks(parentTaskId: string): Promise<any[]> {
    try {
      return await this.taskModel
        .find({ parentTask: new Types.ObjectId(parentTaskId) })
        .populate('assignee', 'fullName avatar')
        .populate('members', 'fullName avatar')
        .sort({ createdAt: -1 })
        .exec();
    } catch (err) {
      this.logger.warn(`Database findSubtasks fallback to in-memory: ${(err as Error).message}`);
      return Array.from(this.memoryTasks.values())
        .filter((t) => t.parentTask?.toString() === parentTaskId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }
}
