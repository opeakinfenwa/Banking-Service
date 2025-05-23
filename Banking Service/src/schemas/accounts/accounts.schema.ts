import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  accountNumber: string;

  @Prop({ enum: ['savings', 'checking'], required: true })
  accountType: 'savings' | 'checking';

  @Prop({ default: 0 })
  balance: number;

  @Prop({ enum: ['active', 'frozen', 'closed'], default: 'active' })
  status: 'active' | 'frozen' | 'closed';

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);