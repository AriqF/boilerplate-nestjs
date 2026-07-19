import type { Cache } from 'cache-manager';
import { CacheService } from './cache.service';

function build() {
  const get = jest.fn();
  const set = jest.fn().mockResolvedValue(undefined);
  const del = jest.fn().mockResolvedValue(undefined);
  const mdel = jest.fn().mockResolvedValue(undefined);
  const cache = { get, set, del, mdel } as unknown as Cache;
  return { service: new CacheService(cache), get, set, del, mdel };
}

describe('CacheService', () => {
  it('get delegates to the cache manager', async () => {
    const { service, get } = build();
    get.mockResolvedValue('value');
    await expect(service.get<string>('k')).resolves.toBe('value');
    expect(get).toHaveBeenCalledWith('k');
  });

  it('set forwards the ttl', async () => {
    const { service, set } = build();
    await service.set('k', { a: 1 }, 5000);
    expect(set).toHaveBeenCalledWith('k', { a: 1 }, 5000);
  });

  it('del delegates to the cache manager', async () => {
    const { service, del } = build();
    await service.del('k');
    expect(del).toHaveBeenCalledWith('k');
  });

  it('mDel delegates to mdel with the key list', async () => {
    const { service, mdel } = build();
    await service.mDel(['a', 'b']);
    expect(mdel).toHaveBeenCalledWith(['a', 'b']);
  });
});
