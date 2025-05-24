import {
  ConflictException,
  NotFoundException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthUtilsService } from '../../common/utils/auth.utils';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { SECURITY_QUESTIONS } from '../../common/utils/securityQuestions';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private authUtilsService: AuthUtilsService,
  ) {}

  async signupUser(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      name,
      password,
      authProvider,
      securityQuestion,
      securityAnswer,
      role,
    } = createUserDto;

    const googleUser = await this.userModel.findOne({
      email,
      authProvider: 'google',
    });
    if (googleUser) {
      throw new ConflictException(
        'This email is already registered with Google login',
      );
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (!SECURITY_QUESTIONS.includes(securityQuestion)) {
      throw new UnauthorizedException('Invalid security question');
    }

    const hashedPassword = await this.authUtilsService.hashPassword(password);
    const hashedAnswer =
      await this.authUtilsService.hashSecurityAnswer(securityAnswer);

    const user = new this.userModel({
      googleId: null,
      email,
      name,
      password: hashedPassword,
      authProvider,
      securityQuestion,
      securityAnswer: hashedAnswer,
      role,
    });

    const newUser = await user.save();
    return newUser;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;

    return user.save();
  }

  async deleteUser(userId: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found or already deleted');
    }

    return { deleted: true };
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel
      .findById(userId)
      .select('-password -securityAnswer')
      .exec();
  }
}
