import { Module } from '@nestjs/common';
import { AccountController } from './accounts.controller';
import { AccountService } from './accounts.service';
import { Account, AccountSchema } from 'src/schemas/accounts/accounts.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'src/database/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    KafkaModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, JwtStrategy],
  exports: [MongooseModule],
})
export class AccountsModule {}