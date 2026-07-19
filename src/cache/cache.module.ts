import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Logger, Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { buildRedisUrl } from '../config/redis.config';
import { CacheDemoController } from './cache-demo.controller';
import { CacheDemoService } from './cache-demo.service';
import { CacheService } from './cache.service';

/**
 * Global cache module backed by Redis (@keyv/redis) using the same central connection
 * config as the raw ioredis client. Default TTL is 60s; override per `set(key, val, ms)`.
 * Exposes CacheService (get/set/del/mDel) for reuse across feature modules.
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        const logger = new Logger('CacheStore');
        const store = createKeyv(buildRedisUrl(config.redis));
        store.on('error', (error: Error) =>
          logger.error(`Cache store error: ${error.message}`),
        );
        return { stores: [store], ttl: 60_000 };
      },
    }),
  ],
  controllers: [CacheDemoController],
  providers: [CacheService, CacheDemoService],
  exports: [CacheService],
})
export class AppCacheModule {}
