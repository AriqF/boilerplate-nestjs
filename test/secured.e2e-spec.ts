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

const API_KEY = 'e2e-secret-key';

// Guard-relevant config only; overrides the real service so the test is independent
// of the ambient environment (the shell may already export API_KEYS).
const configStub = {
  apiKeys: [API_KEY],
  apiTimestampToleranceSec: 300,
  redis: { host: '127.0.0.1', port: 6379 },
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
