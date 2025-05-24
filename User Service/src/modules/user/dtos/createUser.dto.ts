import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role = Role.CUSTOMER;

  @IsString()
  @IsOptional()
  authProvider: string = 'local';

  @IsString()
  @IsNotEmpty()
  securityQuestion: string;

  @IsString()
  @IsNotEmpty()
  securityAnswer: string;
}