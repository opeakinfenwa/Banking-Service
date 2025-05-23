import { Module } from '@nestjs/common';
import { KafkaProducerService } from './producer';

@Module({
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}