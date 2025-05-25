import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from 'src/common/guards/auth.guards';
import { RolesGuard } from 'src/common/guards/role.guards';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'src/common/enums/role.enum';
import { firstValueFrom } from 'rxjs';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionGatewayController {
  private readonly TRANSACTION_SERVICE_URL: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.TRANSACTION_SERVICE_URL = this.configService.get<string>(
      'TRANSACTION_SERVICE_URL',
      'http://localhost:3002/transactions',
    );
  }

  @Post()
  async create(@Body() dto, @Req() req) {
    const userId = req.user?._id;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.TRANSACTION_SERVICE_URL}/transactions`,
        dto,
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );

    return response.data;
  }

  @Get(':accountNumber')
  async getUserTransactions(
    @Param('accountNumber') accountNumber: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.TRANSACTION_SERVICE_URL}/transactions/${accountNumber}`,
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );

    return response.data;
  }

  @Get(':transactionId/details')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getTransactionById(
    @Param('transactionId') transactionId: string,
    @Req() req,
  ) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.TRANSACTION_SERVICE_URL}/transactions/${transactionId}/details`,
        {
          headers: { Authorization: req.headers.authorization },
        },
      ),
    );

    return response.data;
  }
}