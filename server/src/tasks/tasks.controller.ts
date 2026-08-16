import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../auth/schemas/user.schema';

/**
 * Tasks controller — CRUD endpoints for tasks.
 *
 * All routes are protected by JwtAuthGuard (applied at the class level),
 * meaning every request must include a valid JWT.
 *
 * Route structure:
 *   POST   /api/tasks          → Create task
 *   GET    /api/tasks          → List tasks (with optional filters)
 *   GET    /api/tasks/:id      → Get single task
 *   PUT    /api/tasks/:id      → Update task
 *   DELETE /api/tasks/:id      → Delete task
 *   GET    /api/tasks/:id/subtasks → Get subtasks
 */
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.tasksService.create(dto, user._id.toString());
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('project') project?: string,
    @Query('parentTask') parentTask?: string,
  ) {
    return this.tasksService.findAll({ status, project, parentTask });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return { message: 'Task deleted successfully' };
  }

  @Get(':id/subtasks')
  async findSubtasks(@Param('id') id: string) {
    return this.tasksService.findSubtasks(id);
  }
}
