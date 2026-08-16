import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Project priority — reuses the same levels as tasks.
 * The Figma Projects page shows a Priority column with
 * the same High/Medium/Low indicators.
 */
export enum ProjectPriority {
  NONE = 'none',
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export type ProjectDocument = HydratedDocument<Project>;

/**
 * Mongoose Project schema.
 *
 * From the Figma Projects page, the table shows:
 * - Projects (name)
 * - Priority (colored indicator)
 * - Lead (user avatar)
 * - Due Date
 * - Actions (... menu)
 *
 * The breadcrumb "Projects > Design Homepage" shows projects
 * contain tasks, which is handled by Task.project reference.
 */
@Schema({ timestamps: true })
export class Project {
  /** Project name — e.g., "Design Homepage" */
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: ProjectPriority, default: ProjectPriority.NONE })
  priority: ProjectPriority;

  /** Project lead — shown as avatar in the table */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  lead?: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  /** Team members */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  /** Who created this project */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
