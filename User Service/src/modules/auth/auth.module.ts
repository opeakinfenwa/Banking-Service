import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from 'src/modules/user/users.module';
import { LocalStrategy } from 'src/common/strategies/local.strategy';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { GoogleStrategy } from 'src/common/strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, GoogleStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
