import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import { ProjectPriority } from '../schemas/project.schema';

/**
 * DTO for creating a new project.
 * Only `name` is required — matches the "+ Add Project" action in Figma.
 */
export class CreateProjectDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @IsOptional()
  @IsMongoId()
  lead?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];
}
