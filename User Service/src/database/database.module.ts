import {
  Module,
  Inject,
  OnModuleDestroy,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LoggerModule } from '../logger/logger.module';
import { Connection } from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './database.config';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forFeature(databaseConfig),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          uri: dbConfig.uri,
          connectTimeoutMS: dbConfig.connectTimeoutMS,
          maxPoolSize: dbConfig.maxPoolSize,
          autoIndex: dbConfig.autoIndex,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule
  implements OnModuleDestroy, OnApplicationShutdown, OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  onModuleInit() {
    if (this.connection.readyState === 1) {
      this.logger.log('Successfully connected to MongoDB', {
        context: 'DatabaseModule',
      });
    } else {
      this.connection.once('open', () => {
        this.logger.log('Successfully connected to MongoDB (delayed event)', {
          context: 'DatabaseModule',
        });
      });

      this.connection.on('error', (err) => {
        this.logger.error('MongoDB connection error', {
          context: 'DatabaseModule',
          error: err.message,
        });
      });
    }
  }

  onModuleDestroy() {
    this.logger.log('DatabaseModule destroyed', {
      context: 'DatabaseModule',
    });
  }

  onApplicationShutdown() {
    this.logger.log('Application shutting down', {
      context: 'DatabaseModule',
    });
  }
}