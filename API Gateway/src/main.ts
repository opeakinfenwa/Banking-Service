import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filters';
import { LoggingInterceptor } from './common/interceptors/logging.interceptors';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { createWinstonLoggerConfig } from './logger/logger.config';
import rateLimit from 'express-rate-limit';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      createWinstonLoggerConfig(new ConfigService()),
    ),
    bufferLogs: true,
  });

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new AllExceptionsFilter(logger, configService));
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );

  app.enableCors({
    origin: ['http://localhost:5000'],
    credentials: true,
  });

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  app.use(cookieParser());
  app.enableShutdownHooks();

  const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT);

  logger.log(`API Gateway running on port ${PORT}`, { module: 'Main' });
}

bootstrap();