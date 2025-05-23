import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthUtilsService {
  constructor(private readonly configService: ConfigService) {}
  async hashPassword(password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  }

  async comparePassword(password: string, hashed: string): Promise<Boolean> {
    const isMatch = await bcrypt.compare(password, hashed);
    return isMatch;
  }

  async hashSecurityAnswer(answer: string) {
    const hashedAnswer = await bcrypt.hash(answer.trim().toLowerCase(), 10);
    return hashedAnswer;
  }

  async compareSecurityAnswer(
    providedAnswer: string,
    storedHashedAnswer?: string,
  ): Promise<boolean> {
    if (!storedHashedAnswer) return false;

    const normalizedAnswer = providedAnswer.trim().toLowerCase();
    return bcrypt.compare(normalizedAnswer, storedHashedAnswer);
  }

  generateAuthToken(payload: { _id: string; role: string; email: string }) {
    const token = jwt.sign(
      payload,
      this.configService.get<string>('JWT_SECRET', { infer: true })!,
      {
        expiresIn: '1d',
      },
    );
    return token;
  }
}