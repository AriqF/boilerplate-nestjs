import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';

const DEMO_KEY = 'demo:timestamp';
const DEMO_TTL_MS = 10_000;

/** Demonstrates CacheService: first call is a miss (sets), subsequent calls hit until TTL. */
@Injectable()
export class CacheDemoService {
  constructor(private readonly cache: CacheService) {}

  async getOrSetTimestamp(): Promise<{ value: number; cached: boolean }> {
    const existing = await this.cache.get<number>(DEMO_KEY);
    if (existing != null) {
      return { value: existing, cached: true };
    }

    const value = Date.now();
    await this.cache.set(DEMO_KEY, value, DEMO_TTL_MS);
    return { value, cached: false };
  }
}
