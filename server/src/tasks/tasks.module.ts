import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskSchema } from './schemas/task.schema';

/**
 * Tasks module — self-contained feature module for task management.
 *
 * MongooseModule.forFeature() registers the Task model within this module.
 * The TasksService can then inject it via @InjectModel(Task.name).
 *
 * exports: [TasksService] makes it available to other modules that
 * might need to query tasks (e.g., a future Dashboard module).
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
