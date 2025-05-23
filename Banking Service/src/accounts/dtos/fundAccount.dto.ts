import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class FundAccountDto {
  @IsNotEmpty()
  accountNumber: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}