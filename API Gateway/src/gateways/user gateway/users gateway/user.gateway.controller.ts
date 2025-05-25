import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Request,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UserGatewayController {
  private readonly USER_SERVICE_URL: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.USER_SERVICE_URL = this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3001/users',
    );
  }

  @Post('signup')
  async signup(@Body() body: any) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.USER_SERVICE_URL}/signup`, body),
    );
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new UnauthorizedException('Not authorized to update this user');
    }

    const { data } = await firstValueFrom(
      this.httpService.put(`${this.USER_SERVICE_URL}/${userId}`, body, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Request() req: any) {
    const { _id: requesterId, role: requesterRole } = req.user;

    if (requesterId !== userId && requesterRole !== 'admin') {
      throw new ForbiddenException('Not authorized to delete this user');
    }

    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.USER_SERVICE_URL}/${userId}`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return data;
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.USER_SERVICE_URL}/${userId}`),
      );
      return data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}