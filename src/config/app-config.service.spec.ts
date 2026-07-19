import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { EnvConfig, NodeEnv, validate } from './env.validation';

/** Build an AppConfigService backed by a validated EnvConfig (mirrors runtime wiring). */
function buildService(raw: Record<string, unknown>): AppConfigService {
  const env = validate(raw);
  const config = {
    get: <K extends keyof EnvConfig>(key: K): EnvConfig[K] => env[key],
  } as unknown as ConfigService<EnvConfig, true>;
  return new AppConfigService(config);
}

describe('AppConfigService', () => {
  it('exposes typed primitives from the loaded env', () => {
    const service = buildService({ PORT: '4000', NODE_ENV: 'production' });

    expect(service.port).toBe(4000);
    expect(service.nodeEnv).toBe(NodeEnv.Production);
    expect(service.isProduction).toBe(true);
    expect(service.apiTimestampToleranceSec).toBe(300);
  });

  it('reports isProduction=false outside production', () => {
    expect(buildService({}).isProduction).toBe(false);
  });

  it('builds the redis config object', () => {
    const service = buildService({
      REDIS_HOST: 'redis.internal',
      REDIS_PORT: '6380',
      REDIS_PASSWORD: 'secret',
    });

    expect(service.redis).toEqual({
      host: 'redis.internal',
      port: 6380,
      password: 'secret',
    });
  });

  it('parses API_KEYS into a trimmed, non-empty array', () => {
    expect(buildService({ API_KEYS: 'a, b ,c' }).apiKeys).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('returns an empty array when no API keys are configured', () => {
    expect(buildService({}).apiKeys).toEqual([]);
  });
});
