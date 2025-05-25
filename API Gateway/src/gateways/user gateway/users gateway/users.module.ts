import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserGatewayController } from './user.gateway.controller';

@Module({
  imports: [HttpModule],
  controllers: [UserGatewayController],
})
export class UsersModule {}