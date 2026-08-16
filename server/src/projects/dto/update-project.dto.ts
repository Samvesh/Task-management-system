import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

/**
 * DTO for updating a project — all fields optional.
 * See update-task.dto.ts for explanation of PartialType().
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
