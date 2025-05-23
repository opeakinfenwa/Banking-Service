import { IsEnum } from 'class-validator';

export class CreateAccountDto {
  @IsEnum(['savings', 'checking'])
  accountType: 'savings' | 'checking';
}