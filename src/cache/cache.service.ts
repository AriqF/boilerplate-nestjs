import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

/** Reusable wrapper over cache-manager with the common operations. */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  /** Store a value; `ttlMs` overrides the module default TTL (omit to use it). */
  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.cache.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  /** Delete multiple keys in one call. */
  async mDel(keys: string[]): Promise<void> {
    await this.cache.mdel(keys);
  }
}
