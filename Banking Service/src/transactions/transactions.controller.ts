import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dtos/createTransaction.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { AuthRequest } from 'src/common/interfaces/authRequest.interface';
import { UnauthorizedException } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enums/role.enum';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto, @Req() req: AuthRequest) {
    const userId = req.user._id;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    const transaction = await this.transactionService.createTransaction(
      dto,
      userId,
    );

    return {
      message: 'Transaction created successfully',
      data: transaction,
    };
  }

  @Get(':accountNumber')
  async getUserTransactions(
    @Param('accountNumber') accountNumber: string,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user._id;
    const transactions = await this.transactionService.getUserTransactions(
      accountNumber,
      userId,
    );

    return {
      message: 'User transactions retrieved successfully',
      data: transactions,
    };
  }

  @Get(':transactionId/details')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getTransactionById(@Param('transactionId') transactionId: string) {
    const transaction =
      await this.transactionService.getTransactionById(transactionId);
    return {
      message: 'Transaction fetched successfully',
      data: transaction,
    };
  }
}