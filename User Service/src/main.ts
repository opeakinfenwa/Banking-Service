import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { createWinstonLoggerConfig } from './logger/logger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filters';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  const logger = WinstonModule.createLogger(
    createWinstonLoggerConfig(configService),
  );
  app.useLogger(logger);

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