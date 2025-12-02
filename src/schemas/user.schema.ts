import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, RegistrationType } from '../common/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: RegistrationType, required: true })
  registrationType: RegistrationType;

  @Prop() // Institute ID (student ID, employee ID, etc.) - Required only for institute registration
  instituteId?: string;

  @Prop() // Institute name
  instituteName?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop() // Email verification token
  verificationToken?: string;

  @Prop() // Firebase UID for storing verification documents
  firebaseUid?: string;

  @Prop() // URL to verification document in Firebase Storage
  verificationDocumentUrl?: string;

  @Prop() // Reset password token
  resetPasswordToken?: string;

  @Prop() // Reset password token expiry
  resetPasswordExpires?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop() // Last login timestamp
  lastLogin?: Date;

  @Prop() // Phone number
  phoneNumber?: string;

  @Prop() // Address
  address?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ instituteId: 1 });
UserSchema.index({ firebaseUid: 1 });
