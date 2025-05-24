import {
  IsNumber,
  IsIn,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  senderAccountNumber?: string;

  @IsOptional()
  @IsString()
  receiverAccountNumber?: string;

  @IsPositive()
  @IsNumber()
  amount: number;

  @IsIn(['deposit', 'withdrawal', 'transfer'])
  type: 'deposit' | 'withdrawal' | 'transfer';

  @IsOptional()
  @IsString()
  description?: string;
}