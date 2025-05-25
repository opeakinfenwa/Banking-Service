import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { RolesGuard } from 'src/common/guards/role.guards';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enums/role.enum';
import { firstValueFrom } from 'rxjs';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountGatewayController {
  private readonly ACCOUNT_SERVICE_URL: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ACCOUNT_SERVICE_URL = this.configService.get<string>(
      'ACCOUNT_SERVICE_URL',
      'http://localhost:3002/accounts',
    );
  }

  @Post()
  async createAccount(@Req() req, @Body() dto) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.ACCOUNT_SERVICE_URL}/accounts`, dto, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Get(':accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAccountById(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.ACCOUNT_SERVICE_URL}/accounts/${accountNumber}`,
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );
    return response.data;
  }

  @Get()
  async getUserAccounts(@Req() req) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.ACCOUNT_SERVICE_URL}/accounts`, {
        headers: { Authorization: req.headers.authorization },
      }),
    );
    return response.data;
  }

  @Patch('freeze/:accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async freezeAccount(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.ACCOUNT_SERVICE_URL}/accounts/freeze/${accountNumber}`,
        {},
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );
    return response.data;
  }

  @Patch('unfreeze/:accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async unfreezeAccount(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.ACCOUNT_SERVICE_URL}/accounts/unfreeze/${accountNumber}`,
        {},
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );
    return response.data;
  }

  @Patch('close/:accountNumber')
  async closeAccount(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.ACCOUNT_SERVICE_URL}/accounts/close/${accountNumber}`,
        {},
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );
    return response.data;
  }

  @Delete(':accountNumber')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteAccount(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.delete(
        `${this.ACCOUNT_SERVICE_URL}/accounts/${accountNumber}`,
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );

    return response.data;
  }

  @Patch('fund')
  async fundAccount(@Req() req, @Body() dto) {
    const response = await firstValueFrom(
      this.httpService.patch(`${this.ACCOUNT_SERVICE_URL}/accounts/fund`, dto, {
        headers: { Authorization: req.headers.authorization },
      }),
    );

    return response.data;
  }

  @Get(':accountNumber/balance')
  async getAccountBalance(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.ACCOUNT_SERVICE_URL}/accounts/${accountNumber}/balance`,
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );

    return response.data;
  }
}