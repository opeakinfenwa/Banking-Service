import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  type: 'deposit' | 'withdrawal' | 'transfer';

  @Prop({ required: false, type: Types.ObjectId, ref: 'Account' })
  senderAccount: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Account' })
  receiverAccount?: Types.ObjectId;

  @Prop()
  senderAccountNumber?: string;

  @Prop()
  receiverAccountNumber?: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['pending', 'successful', 'failed'], default: 'pending' })
  status: 'pending' | 'successful' | 'failed';

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);