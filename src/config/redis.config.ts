import { RedisOptions } from 'ioredis';
import { RedisConfig } from './app-config.service';

/** ioredis connection options for the raw client (and, in Task 5, BullMQ). */
export function buildRedisOptions(redis: RedisConfig): RedisOptions {
  return {
    host: redis.host,
    port: redis.port,
    password: redis.password,
  };
}

/** redis:// URL for the cache-manager (@keyv/redis) store — same host/port/password. */
export function buildRedisUrl(redis: RedisConfig): string {
  const auth = redis.password ? `:${encodeURIComponent(redis.password)}@` : '';
  return `redis://${auth}${redis.host}:${redis.port}`;
}
