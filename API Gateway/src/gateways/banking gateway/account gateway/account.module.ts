import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccountGatewayController } from './account.gateway.controller';

@Module({
  imports: [HttpModule],
  controllers: [AccountGatewayController],
})
export class AccountModule {}