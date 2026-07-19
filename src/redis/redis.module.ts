import { Global, Logger, Module } from '@nestjs/common';
import IORedis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { buildRedisOptions } from '../config/redis.config';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

/**
 * Global module exposing a single shared ioredis client (REDIS_CLIENT) built from the
 * central config, plus RedisService. An 'error' listener keeps a dropped connection from
 * crashing the process (EventEmitter would otherwise throw on an unhandled error event).
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        const logger = new Logger('RedisClient');
        // lazyConnect: connect on first command, so importing the module never opens a
        // socket at boot (keeps tests independent of a running Redis).
        const client = new IORedis({
          ...buildRedisOptions(config.redis),
          lazyConnect: true,
        });
        client.on('error', (error: Error) =>
          logger.error(`Redis connection error: ${error.message}`),
        );
        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
