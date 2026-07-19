import type { Redis } from 'ioredis';
import { RedisService } from './redis.service';

function build(client: Partial<Redis>): RedisService {
  return new RedisService(client as Redis);
}

describe('RedisService', () => {
  it('ping resolves true on PONG', async () => {
    const service = build({ ping: jest.fn().mockResolvedValue('PONG') });
    await expect(service.ping()).resolves.toBe(true);
  });

  it('ping resolves false when the client throws', async () => {
    const service = build({
      ping: jest.fn().mockRejectedValue(new Error('unreachable')),
    });
    await expect(service.ping()).resolves.toBe(false);
  });

  it('quits the client on destroy', async () => {
    const quit = jest.fn().mockResolvedValue('OK');
    await build({ quit }).onModuleDestroy();
    expect(quit).toHaveBeenCalledTimes(1);
  });

  it('falls back to disconnect when quit fails', async () => {
    const disconnect = jest.fn();
    await build({
      quit: jest.fn().mockRejectedValue(new Error('already closed')),
      disconnect,
    }).onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
