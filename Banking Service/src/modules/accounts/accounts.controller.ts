import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AccountService } from './accounts.service';
import { CreateAccountDto } from './dtos/createAccount.dto';
import { FundAccountDto } from './dtos/fundAccount.dto';
import { AuthRequest } from 'src/common/interfaces/authRequest.interface';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enums/role.enum';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(@Req() req: AuthRequest, @Body() dto: CreateAccountDto) {
    const userId = req.user._id;
    console.log('User ID from JWT:', userId);
    const account = await this.accountService.createAccount(dto, userId);
    return {
      message: 'Account created successfully',
      data: account,
    };
  }

  @Get(':accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAccountById(@Param('accountNumber') accountNumber: string) {
    const account =
      await this.accountService.getAccountByAccountNumber(accountNumber);
    return {
      message: 'Account details fetched successfully',
      data: account,
    };
  }

  @Get()
  async getUserAccounts(@Req() req: AuthRequest) {
    const userId = req.user._id;
    const accounts = await this.accountService.getUserAccounts(userId);
    return {
      message: 'Accounts fetched successfully',
      data: accounts,
    };
  }

  @Patch('freeze/:accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async freezeAccount(@Param('accountNumber') accountNumber: string) {
    const updatedAccount =
      await this.accountService.freezeAccount(accountNumber);
    return {
      message: 'Account frozen successfully',
      data: updatedAccount,
    };
  }

  @Patch('unfreeze/:accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async unfreezeAccount(@Param('accountNumber') accountNumber: string) {
    const updatedAccount =
      await this.accountService.unfreezeAccount(accountNumber);
    return {
      message: 'Account Unfrozen successfully',
      data: updatedAccount,
    };
  }

  @Patch('close/:accountNumber')
  async closeAccount(
    @Param('accountNumber') accountNumber: string,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user._id;
    const account =
      await this.accountService.getAccountByAccountNumber(accountNumber);
    if (account.userId.toString() !== userId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Not authorized to close this account');
    }
    const updatedAccount =
      await this.accountService.closeAccount(accountNumber);
    return {
      message: 'Account closed successfully',
      data: updatedAccount,
    };
  }

  @Delete(':accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteAccount(@Param('accountNumber') accountNumber: string) {
    const result = await this.accountService.deleteAccount(accountNumber);
    return {
      message: 'Account deleted successfully',
      data: result,
    };
  }

  @Patch('fund')
  async fundAccount(@Req() req: AuthRequest, @Body() dto: FundAccountDto) {
    const userId = req.user._id;
    const updatedBalance = await this.accountService.fundAccount(dto, userId);
    return {
      message: 'Account funded successfully',
      data: updatedBalance,
    };
  }

  @Get(':accountNumber/balance')
  async getAccountBalance(
    @Req() req: AuthRequest,
    @Param('accountNumber') accountNumber: string,
  ) {
    const userId = req.user._id;
    console.log('User ID from JWT:', userId);
    const accountBalance = await this.accountService.getAccountBalance(
      accountNumber,
      userId,
    );
    return {
      message: 'Account balance successfully fetcehd',
      data: accountBalance,
    };
  }
}