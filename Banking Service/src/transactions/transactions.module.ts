import { Module } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from 'src/schemas/transactions/transactions.schema';
import { PassportModule } from '@nestjs/passport';
import { AccountsModule } from 'src/accounts/accounts.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { UserHttpClient } from 'src/common/clients/http.clients';


@Module({
  imports: [HttpModule, AccountsModule ,DatabaseModule, PassportModule, MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]), KafkaModule],
  providers: [TransactionService, UserHttpClient],
 controllers: [TransactionController]
})
export class TransactionsModule {}