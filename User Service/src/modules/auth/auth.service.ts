import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthUtilsService } from '../../common/utils/auth.utils';
import { User, UserDocument } from '../../schemas/user.schema';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';

type UserWithId = User & { _id: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly authUtilsService: AuthUtilsService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
    }

    const isPasswordValid = await this.authUtilsService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async login(user: Omit<UserWithId, 'password'>): Promise<{
    token: string;
    user: Omit<User, 'password'>;
  }> {
    const token = this.authUtilsService.generateAuthToken({
      _id: user._id,
      role: user.role,
      email: user.email,
    });

    return { token, user };
  }

  async handleGoogleLogin(
    googleId: string,
    email: string,
    name: string,
    role: string,
    authProvider: string,
  ) {
    let user = await this.userModel.findOne({ googleId });

    if (!user) {
      user = new this.userModel({
        googleId,
        email,
        name,
        role,
        authProvider,
      });
      await user.save();
    }

    const token = this.authUtilsService.generateAuthToken({
      _id: user.id,
      role: user.role,
      email: user.email,
    });

    return { user, token };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<User> {
    const { email, newPassword, securityAnswer } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAnswerCorrect = await this.authUtilsService.compareSecurityAnswer(
      securityAnswer,
      user.securityAnswer,
    );

    if (!isAnswerCorrect) {
      throw new UnauthorizedException('Incorrect security answer');
    }

    user.password = await this.authUtilsService.hashPassword(newPassword);

    return user.save();
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<User> {
    const { currentPassword, newPassword } = dto;

    const user = await this.userModel.findById(userId);
    if (!user || !user.password) {
      throw new NotFoundException('User not found or has no password');
    }

    const isValid = await this.authUtilsService.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await this.authUtilsService.hashPassword(newPassword);

    return user.save();
  }
}
