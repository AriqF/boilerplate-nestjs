import { CacheDemoService } from './cache-demo.service';
import { CacheService } from './cache.service';

describe('CacheDemoService', () => {
  it('sets on a miss, then reports a hit with the same value', async () => {
    const store = new Map<string, number>();
    const get = jest.fn((key: string) => Promise.resolve(store.get(key)));
    const set = jest.fn((key: string, value: number) => {
      store.set(key, value);
      return Promise.resolve();
    });
    const cache = { get, set } as unknown as CacheService;
    const service = new CacheDemoService(cache);

    const first = await service.getOrSetTimestamp();
    expect(first.cached).toBe(false);
    expect(set).toHaveBeenCalledTimes(1);

    const second = await service.getOrSetTimestamp();
    expect(second.cached).toBe(true);
    expect(second.value).toBe(first.value);
    expect(set).toHaveBeenCalledTimes(1);
  });
});
