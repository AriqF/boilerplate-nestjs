import { EnvConfig, NodeEnv, validate } from './env.validation';

describe('validate (env schema)', () => {
  it('applies defaults when nothing is provided', () => {
    const config = validate({});

    expect(config).toBeInstanceOf(EnvConfig);
    expect(config.NODE_ENV).toBe(NodeEnv.Development);
    expect(config.PORT).toBe(3000);
    expect(config.REDIS_HOST).toBe('localhost');
    expect(config.REDIS_PORT).toBe(6379);
    expect(config.REDIS_PASSWORD).toBeUndefined();
    expect(config.API_KEYS).toBe('');
    expect(config.API_TIMESTAMP_TOLERANCE_SEC).toBe(300);
  });

  it('coerces numeric string env values to numbers', () => {
    const config = validate({ PORT: '4000', REDIS_PORT: '6380' });

    expect(config.PORT).toBe(4000);
    expect(config.REDIS_PORT).toBe(6380);
  });

  it('accepts a fully specified valid config', () => {
    const config = validate({
      NODE_ENV: 'production',
      PORT: '8080',
      REDIS_HOST: 'redis.internal',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'secret',
      API_KEYS: 'a,b',
      API_TIMESTAMP_TOLERANCE_SEC: '60',
    });

    expect(config.NODE_ENV).toBe(NodeEnv.Production);
    expect(config.REDIS_PASSWORD).toBe('secret');
    expect(config.API_TIMESTAMP_TOLERANCE_SEC).toBe(60);
  });

  it.each([
    ['PORT not a number', { PORT: 'abc' }],
    ['PORT out of range', { PORT: '70000' }],
    ['NODE_ENV not in enum', { NODE_ENV: 'staging' }],
    ['REDIS_HOST empty', { REDIS_HOST: '' }],
    ['tolerance below minimum', { API_TIMESTAMP_TOLERANCE_SEC: '0' }],
  ])('throws when %s', (_label, invalid) => {
    expect(() => validate(invalid)).toThrow(/Environment validation failed/);
  });

  it('reports every failing constraint in the error message', () => {
    expect(() => validate({ PORT: 'abc', NODE_ENV: 'staging' })).toThrow(
      /PORT.*\n?.*NODE_ENV|NODE_ENV.*\n?.*PORT/s,
    );
  });
});
