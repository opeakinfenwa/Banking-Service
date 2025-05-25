import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.method === 'OPTIONS') {
      response.status(HttpStatus.OK).send();
      return;
    }

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string' ? res : (res as any)?.message || message;
      stack = exception.stack;
    } else if ((exception as AxiosError).isAxiosError) {
      const axiosError = exception as AxiosError;
      const axiosRes = axiosError.response;

      const axiosData = axiosRes?.data as any;

      status = axiosRes?.status || HttpStatus.BAD_GATEWAY;
      message =
        axiosData?.message ||
        axiosData?.error ||
        axiosError.message ||
        'Upstream service error';
      stack = axiosError.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    const logDetails = {
      method: request.method,
      url: request.originalUrl,
      ip: request.ip,
      status,
      userAgent: request.headers['user-agent'],
      ...(isProd ? {} : { stack }),
    };

    this.logger.error(
      `[${request.method}] ${request.originalUrl}  ${message}`,
      logDetails,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      error: message,
      ...(isProd ? {} : { stack }),
    });
  }
}