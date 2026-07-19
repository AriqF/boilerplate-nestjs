import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { buildRedisOptions } from '../config/redis.config';
import { DEMO_QUEUE } from './queue.constants';
import { QueueController } from './queue.controller';
import { DemoProcessor } from './queue.processor';
import { QueueService } from './queue.service';

/**
 * BullMQ wiring: root connection from the central Redis config, plus the demo queue with
 * sensible retry/cleanup defaults. Producer (QueueService) + worker (DemoProcessor).
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        connection: buildRedisOptions(config.redis),
      }),
    }),
    BullModule.registerQueue({
      name: DEMO_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, DemoProcessor],
})
export class QueueModule {}
