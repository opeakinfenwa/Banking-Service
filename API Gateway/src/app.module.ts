import { Module } from '@nestjs/common';
import { AccountModule } from './gateways/banking gateway/account gateway/account.module';
import { TransactionModule } from './gateways/banking gateway/transaction gateway/transaction.module';
import { UsersModule } from './gateways/user gateway/users gateway/users.module';
import { AuthModule } from './gateways/user gateway/auth gateway/auth.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    AuthModule,
    AccountModule,
    TransactionModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}