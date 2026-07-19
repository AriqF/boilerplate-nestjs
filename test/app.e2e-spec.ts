import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import {
  ErrorResponse,
  SuccessResponse,
} from './../src/common/dto/response.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('wraps a successful response in the envelope', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    const body = res.body as SuccessResponse<string>;

    expect(body).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: 'Hello World!',
      path: '/',
    });
    expect(body.requestId).toEqual(expect.any(String));
    expect(res.headers['x-request-id']).toBe(body.requestId);
  });

  it('returns the standardized error envelope for an unknown route', async () => {
    const res = await request(app.getHttpServer())
      .get('/does-not-exist')
      .expect(404);
    const body = res.body as ErrorResponse;

    expect(body).toMatchObject({
      success: false,
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      path: '/does-not-exist',
    });
    expect(body.requestId).toEqual(expect.any(String));
  });
});
