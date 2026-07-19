import { INestApplication, ValidationPipe } from '@nestjs/common';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

/**
 * Applies runtime configuration that lives outside the module graph (middleware, pipes).
 * Shared by `main.ts` and e2e tests so both boot an identically configured app.
 */
export function configureApp(app: INestApplication): void {
  app.use(requestIdMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Ensure graceful teardown of Redis/BullMQ connections (on SIGTERM in prod,
  // and on app.close() in tests).
  app.enableShutdownHooks();
}
