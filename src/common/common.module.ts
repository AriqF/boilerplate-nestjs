import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ApiKeyGuard } from './guards/api-key.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';

/**
 * Registers the global response envelope interceptor, error mapping filter, and the
 * API-key guard. Order note: the guard runs before the interceptor; both run after the
 * requestId middleware (registered via app.use), so error envelopes always carry a requestId.
 */
@Module({
  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class CommonModule {}
