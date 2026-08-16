import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Mongoose User schema.
 *
 * This maps to what we see in the Figma's Profile/Settings screen:
 * - Profile picture (avatar URL)
 * - Email (dexter@gmail.com)
 * - Full name (Dexter)
 * - Title / job role (Designer)
 * - Username (Dexuser)
 *
 * Plus auth-related fields:
 * - isGuest: marks "Continue as Guest" sessions
 *
 * In Express + Mongoose you'd write:
 *   const userSchema = new mongoose.Schema({ ... });
 *   module.exports = mongoose.model('User', userSchema);
 *
 * NestJS's @nestjs/mongoose uses decorators instead, but it produces
 * the exact same Mongoose schema under the hood.
 */
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ sparse: true })
  email?: string;

  @Prop({ sparse: true })
  username?: string;

  @Prop()
  title?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  isGuest: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
