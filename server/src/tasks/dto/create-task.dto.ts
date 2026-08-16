import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';

/**
 * DTO for creating a new task.
 *
 * Only `title` is required — everything else is optional because
 * the Figma shows "+ Add Task" as a quick-add action that just needs
 * a name. The user can fill in details later via the detail view.
 */
export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsMongoId()
  assignee?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsMongoId()
  project?: string;

  @IsOptional()
  @IsMongoId()
  parentTask?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];
}
