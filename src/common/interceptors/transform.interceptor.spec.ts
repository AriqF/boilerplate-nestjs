import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { SuccessResponse } from '../dto/response.dto';
import { TransformInterceptor } from './transform.interceptor';

function mockContext(): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ id: 'req-1', url: '/things' }),
      getResponse: () => ({ statusCode: 200 }),
    }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

function callHandler(value: unknown): CallHandler {
  return { handle: () => of(value) } as CallHandler;
}

describe('TransformInterceptor', () => {
  it('wraps the handler payload in the success envelope', async () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;
    const interceptor = new TransformInterceptor(reflector);

    const result = (await lastValueFrom(
      interceptor.intercept(mockContext(), callHandler({ id: 1 })),
    )) as SuccessResponse<{ id: number }>;

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: { id: 1 },
      path: '/things',
      requestId: 'req-1',
    });
    expect(typeof result.timestamp).toBe('string');
  });

  it('uses the @ResponseMessage override when present', async () => {
    const reflector = {
      getAllAndOverride: () => 'Created successfully',
    } as unknown as Reflector;
    const interceptor = new TransformInterceptor(reflector);

    const result = (await lastValueFrom(
      interceptor.intercept(mockContext(), callHandler('ok')),
    )) as SuccessResponse<string>;

    expect(result.message).toBe('Created successfully');
    expect(result.data).toBe('ok');
  });
});
