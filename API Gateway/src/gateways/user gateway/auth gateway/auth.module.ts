import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth.gateway.controller';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';

@Module({
  imports: [HttpModule],
  controllers: [AuthGatewayController],
  providers: [JwtStrategy],
})
export class AuthModule {}
