import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Task statuses — matching the Kanban board columns in the Figma.
 * The board shows: "To Do", "Doing", "Completed", "On Hold"
 */
export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  COMPLETED = 'completed',
  ON_HOLD = 'on-hold',
}

/**
 * Task priority levels — from the priority dropdown in the Figma.
 * Shows: No Priority, Urgent (red), High (orange), Medium (yellow), Low (gray)
 */
export enum TaskPriority {
  NONE = 'none',
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export type TaskDocument = HydratedDocument<Task>;

/**
 * Mongoose Task schema — every field maps to something visible in the Figma.
 *
 * Board card view shows: title, assignee (avatar), dueDate, labels
 * List view shows: title, priority, members (avatars), dueDate, actions
 * Detail view adds: description, properties, labels, resources, subtasks,
 *   comments/updates, and a right-side details panel with status, priority,
 *   members, dates, labels, teams, reporter
 */
@Schema({ timestamps: true })
export class Task {
  /** Task title — e.g., "Write API Documentation" */
  @Prop({ required: true })
  title: string;

  /** Rich text description shown in the detail view */
  @Prop()
  description?: string;

  /** Current status — maps to Kanban columns */
  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  /** Priority level — shown with colored indicators */
  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.NONE })
  priority: TaskPriority;

  /** Due date — shown as "29 Jul" on cards, full date in list view */
  @Prop()
  dueDate?: Date;

  /** Primary assignee — shown as avatar on board cards */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee?: Types.ObjectId;

  /** Additional members — shown as avatar stack in list view */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  /** Label tags — "Research", "Design", "Development", "Testing", "Deployment" */
  @Prop({ type: [String], default: [] })
  labels: string[];

  /** Who reported/created this task */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  reporter?: Types.ObjectId;

  /** Parent project reference */
  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project?: Types.ObjectId;

  /** Parent task (for subtasks — visible in the detail view) */
  @Prop({ type: Types.ObjectId, ref: 'Task' })
  parentTask?: Types.ObjectId;

  /** Attached resources / links */
  @Prop({ type: [String], default: [] })
  resources: string[];

  /** Who created this task (for audit / ownership) */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
