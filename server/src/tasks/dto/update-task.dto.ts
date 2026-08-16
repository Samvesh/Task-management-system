import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * DTO for updating a task.
 *
 * PartialType() takes the CreateTaskDto and makes every field optional.
 * This is a NestJS utility — it copies all the validation decorators
 * but wraps them with @IsOptional().
 *
 * So if CreateTaskDto has:
 *   @IsString() @MaxLength(200) title: string;
 *
 * UpdateTaskDto will have:
 *   @IsOptional() @IsString() @MaxLength(200) title?: string;
 *
 * This avoids duplicating validation rules. If you add a field to
 * CreateTaskDto, UpdateTaskDto gets it automatically.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
