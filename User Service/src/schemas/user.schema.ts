import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  googleId?: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({
    required: function () {
      return this.authProvider === 'local';
    },
  })
  password: string;

  @Prop({ enum: ['customer', 'admin'], default: 'customer' })
  role: string;

  @Prop({ enum: ['google', 'local'], default: 'local' })
  authProvider: string;

  @Prop({ required: true })
  name?: string;

  @Prop()
  securityQuestion?: string;

  @Prop()
  securityAnswer?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);