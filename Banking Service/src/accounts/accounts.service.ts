import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Account, AccountDocument } from '../schemas/accounts/accounts.schema';
import { generateRandomAccountNumber } from 'src/common/utils/generateAccountNumber.utils';
import { CreateAccountDto } from './dtos/createAccount.dto';
import { KafkaProducerService } from 'src/kafka/producer';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async createAccount(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    const accountNumber = generateRandomAccountNumber(10);
    const newAccount = new this.accountModel({
      ...createAccountDto,
      userId: new mongoose.Types.ObjectId(userId),
      accountNumber,
    });
    return await newAccount.save();
  }

  async getAccountByAccountNumber(accountNumber: string): Promise<Account> {
    const account = await this.accountModel.findOne({ accountNumber }).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    return await this.accountModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .exec();
  }

  async freezeAccount(accountNumber: string): Promise<Account> {
    const account = await this.accountModel.findOne({ accountNumber }).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.status === 'frozen' || account.status === 'closed') {
      throw new ForbiddenException('Account is already frozen or closed');
    }

    account.status = 'frozen';
    return await account.save();
  }

  async unfreezeAccount(accountNumber: string): Promise<Account> {
    const account = await this.accountModel.findOne({ accountNumber }).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.status !== 'frozen') {
      throw new ForbiddenException('Only frozen accounts can be unfrozen');
    }

    account.status = 'active';
    return await account.save();
  }

  async closeAccount(accountNumber: string): Promise<Account> {
    const account = await this.accountModel.findOne({ accountNumber }).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.status !== 'frozen') {
      throw new ForbiddenException(
        'Account must be frozen before it can be closed',
      );
    }

    account.status = 'closed';
    return await account.save();
  }

  async deleteAccount(accountNumber: string): Promise<void> {
    await this.accountModel.deleteOne({ accountNumber }).exec();
  }

  async fundAccount(
    dto: { accountNumber: string; amount: number },
    userId: string,
  ): Promise<Account> {
    const { accountNumber, amount } = dto;

    const account = await this.accountModel
      .findOne({ accountNumber, userId })
      .exec();
    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }

    if (account.status !== 'active') {
      throw new ForbiddenException('Cannot fund a non-active account');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    account.balance += amount;
    const updatedAccount = await account.save();

    await this.kafkaProducer.emit('AccountFunded', {
      accountNumber,
      userId,
      amount,
      balance: updatedAccount.balance,
      timestamp: new Date().toISOString(),
    });

    return updatedAccount;
  }

  async getAccountBalance(
    accountNumber: string,
    userId: string,
  ): Promise<number> {
    const account = await this.accountModel
      .findOne({ accountNumber, userId })
      .exec();

    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }

    if (account.status !== 'active') {
      throw new ForbiddenException(
        'Cannot retrieve balance for a non-active account',
      );
    }

    return account.balance;
  }
}