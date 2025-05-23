import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { AuthRequest } from 'src/common/interfaces/authRequest.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.signupUser(createUserDto);
    return {
      message: 'User registered successfully',
      data: newUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthRequest,
  ) {
    if (req.user._id !== userId) {
      throw new UnauthorizedException('Not authorized to update this user');
    }

    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );
    return {
      message: 'User updated successfuly',
      data: updatedUser,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Request() req: AuthRequest) {
    const { _id: requesterId, role: requesterRole } = req.user;

    if (requesterId !== userId && requesterRole !== 'admin') {
      throw new ForbiddenException('Not authorized to delete this user');
    }

    const result = await this.userService.deleteUser(userId);
    return {
      message: 'User deleted successfuly',
      data: result,
    };
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}