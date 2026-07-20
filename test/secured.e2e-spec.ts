import { existsSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { AppConfigService } from './../src/config/app-config.service';
import {
  ErrorResponse,
  SuccessResponse,
} from './../src/common/dto/response.dto';

// Load .env so the real Redis/Postgres creds are available (Jest doesn't load it for us).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const API_KEY = 'e2e-secret-key';

// Force a known API key (so the test is independent of the ambient API_KEYS the shell
// may export), but source the real infra connection creds from .env — the guard tests
// still boot the full AppModule, which connects to Redis and Postgres.
const configStub = {
  apiKeys: [API_KEY],
  apiTimestampToleranceSec: 300,
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  },
  postgres: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'postgres',
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.POSTGRES_SSL === 'true',
  },
} as unknown as AppConfigService;

describe('ApiKeyGuard (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppConfigService)
      .useValue(configStub)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects a protected route with no credentials', async () => {
    const res = await request(app.getHttpServer()).get('/secure').expect(401);
    const body = res.body as ErrorResponse;

    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('UNAUTHORIZED');
  });

  it('rejects a stale timestamp', async () => {
    await request(app.getHttpServer())
      .get('/secure')
      .set('x-api-key', API_KEY)
      .set('x-timestamp', String(Date.now() - 10 * 60 * 1000))
      .expect(401);
  });

  it('accepts a valid key with a fresh timestamp', async () => {
    const res = await request(app.getHttpServer())
      .get('/secure')
      .set('x-api-key', API_KEY)
      .set('x-timestamp', String(Date.now()))
      .expect(200);
    const body = res.body as SuccessResponse<{ message: string }>;

    expect(body.success).toBe(true);
    expect(body.message).toBe('Authorized');
    expect(body.data).toEqual({ message: 'You are authorized' });
  });

  it('keeps the public root endpoint open', async () => {
    await request(app.getHttpServer()).get('/').expect(200);
  });
});
