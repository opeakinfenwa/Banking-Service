import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AuthRequest } from 'src/common/interfaces/authRequest.interface';

@Controller('auth')
export class AuthGatewayController {
  private readonly AUTH_SERVICE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.AUTH_SERVICE_URL = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:3001/auth',
    );
  }

  @Post('login')
  async login(@Request() req, @Response() res) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.AUTH_SERVICE_URL}/login`, req.body),
    );

    const { data: user, token } = response.data;

    res
      .setHeader('Authorization', `Bearer ${token}`)
      .cookie('token', token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: this.configService.get('NODE_ENV') === 'production',
        httpOnly: true,
        sameSite: true,
      })
      .json({
        message: 'User successfully logged in',
        data: user,
      });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Response() res) {
    res
      .clearCookie('token', {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: true,
      })
      .setHeader('Authorization', '')
      .json({ message: 'User successfully logged out' });
  }

  @Get()
  getEntry(@Response() res) {
    return res.send(`<a href="/auth/google"> Authenticate with Google</a>`);
  }

  @Get('google')
  async googleLogin(@Response() res) {
    return res.redirect(`${this.AUTH_SERVICE_URL}/google`);
  }

  @Get('google/callback')
  async googleCallback(@Request() req, @Response() res) {
    const redirectUrl = `${this.AUTH_SERVICE_URL}/google/callback`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(redirectUrl, {
          headers: req.headers,
          maxRedirects: 0,
          validateStatus: (status) => status < 400 || status === 302,
        }),
      );

      res
        .cookie('token', data.token, {
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
          sameSite: true,
        })
        .redirect(`/auth/dashboard?token=${data.token}`);
    } catch (err) {
      return res.redirect('/auth/failure');
    }
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  dashboard(@Request() req) {
    return {
      message: 'Welcome to your dashboard!',
      user: req.user,
    };
  }

  @Get('failure')
  failure() {
    return {
      message: 'Authentication failed. Please try again.',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: any) {
    await firstValueFrom(
      this.httpService.post(`${this.AUTH_SERVICE_URL}/reset-password`, dto),
    );
    return { message: 'Password reset successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: AuthRequest, @Body() dto: any) {
    await firstValueFrom(
      this.httpService.post(`${this.AUTH_SERVICE_URL}/change-password`, dto, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return { message: 'Password changed successfully' };
  }
}