import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionGatewayController } from './transaction.gateway.controller';

@Module({
  imports: [HttpModule],
  controllers: [TransactionGatewayController],
})
export class TransactionModule {}