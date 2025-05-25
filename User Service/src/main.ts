import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createWinstonLoggerConfig } from './logger/logger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filters';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      createWinstonLoggerConfig(new ConfigService()),
    ),
    bufferLogs: true,
  });

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger, configService));

  app.use(cookieParser());
  app.enableShutdownHooks();

  const PORT = configService.get<number>('PORT') || 3001;
  await app.listen(PORT);

  logger.log(`User Service listening on port ${PORT}`, { module: 'Main' });
}

bootstrap();