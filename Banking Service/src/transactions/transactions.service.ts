import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Connection } from 'mongoose';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { Account, AccountDocument } from 'src/schemas/accounts/accounts.schema';
import {
  Transaction,
  TransactionDocument,
} from 'src/schemas/transactions/transactions.schema';
import { CreateTransactionDto } from './dtos/createTransaction.dto';
import { KafkaProducerService } from 'src/kafka/producer';
import { UserHttpClient } from 'src/common/clients/http.clients';
import { User } from 'src/common/interfaces/user.interface';

@Injectable()
export class TransactionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  async createTransaction(
    dto: CreateTransactionDto,
    userId: string,
  ): Promise<Transaction> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      let sender: AccountDocument | null = null;
      let receiver: AccountDocument | null = null;

      if (dto.type === 'transfer') {
        sender = await this.accountModel
          .findOne({ accountNumber: dto.senderAccountNumber })
          .session(session);
        receiver = await this.accountModel
          .findOne({ accountNumber: dto.receiverAccountNumber })
          .session(session);
        if (!sender || !receiver)
          throw new NotFoundException('Sender or receiver not found');
        if (sender.balance < dto.amount)
          throw new BadRequestException('Insufficient balance');

        sender.balance -= dto.amount;
        receiver.balance += dto.amount;

        await sender.save({ session });
        await receiver.save({ session });
      } else if (dto.type === 'withdrawal') {
        sender = await this.accountModel
          .findOne({ accountNumber: dto.senderAccountNumber })
          .session(session);
        if (!sender) throw new NotFoundException('Account not found');
        if (sender.balance < dto.amount)
          throw new BadRequestException('Insufficient balance');

        sender.balance -= dto.amount;
        await sender.save({ session });
      } else if (dto.type === 'deposit') {
        receiver = await this.accountModel
          .findOne({ accountNumber: dto.receiverAccountNumber })
          .session(session);
        if (!receiver) throw new NotFoundException('Account not found');

        receiver.balance += dto.amount;
        await receiver.save({ session });
      }

      const transaction = new this.transactionModel({
        userId,
        type: dto.type,
        amount: dto.amount,
        status: 'successful',
        senderAccount: sender?._id,
        receiverAccount: receiver?._id,
        senderAccountNumber: sender?.accountNumber,
        receiverAccountNumber: receiver?.accountNumber,
        description: dto.description,
      });

      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      await this.kafkaProducer.emit('TransactionCompleted', {
        userId,
        amount: dto.amount,
        type: dto.type,
        description: dto.description,
        status: 'success',
        timestamp: new Date().toISOString(),
      });

      return transaction;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error('Transaction error:', error);

      await this.transactionModel.create({
        userId: userId,
        type: dto.type,
        status: 'failed',
        amount: dto.amount,
        senderAccountNumber: dto.senderAccountNumber,
        receiverAccountNumber: dto.receiverAccountNumber,
        description: dto.description || 'Transaction failed',
      });

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        await this.kafkaProducer.emit('TransactionFailed', {
          userId,
          amount: dto.amount,
          type: dto.type,
          reason: error.message,
          description: dto.description || 'Transaction failed',
          status: 'failed',
          timestamp: new Date().toISOString(),
        });
      }

      throw new InternalServerErrorException('Transaction failed');
    }
  }

  async getUserTransactions(
    accountNumber: string,
    userId: string,
  ): Promise<(Transaction & { user: User })[]> {
    const account = await this.accountModel.findOne({ accountNumber });
    if (!account || account.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied: Not your account');
    }

    const transactions = await this.transactionModel
      .find({
        $or: [{ senderAccount: account._id }, { receiverAccount: account._id }],
      })
      .populate('senderAccount', 'accountNumber balance')
      .populate('receiverAccount', 'accountNumber balance')
      .exec();

    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const user = await this.userHttpClient.fetchUserById(
          tx.userId.toString(),
        );
        return {
          ...tx.toObject(),
          user,
        };
      }),
    );

    return enrichedTransactions;
  }

  async getTransactionById(transactionId: string): Promise<any> {
    const transaction = await this.transactionModel
      .findById(transactionId)
      .populate('senderAccount', 'accountNumber balance')
      .populate('receiverAccount', 'accountNumber balance')
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const user = await this.userHttpClient.fetchUserById(
      transaction.userId.toString(),
    );

    return {
      ...transaction.toObject(),
      user,
    };
  }
}