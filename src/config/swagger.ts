import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  API_KEY_HEADER,
  API_KEY_SECURITY,
} from '../common/constants/security.constants';

/** Mounts Swagger UI at /docs with the API-key + timestamp security schemes. */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription(
      'Protected endpoints require the `x-api-key` and `x-timestamp` headers.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: API_KEY_HEADER,
        in: 'header',
        description: 'Configured API key.',
      },
      API_KEY_SECURITY,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      // Keep the API key entered in the Authorize box across page reloads.
      persistAuthorization: true,
      // Runs client-side (serialized into the page) before every request: stamp a fresh
      // x-timestamp so the guard's freshness window is always satisfied without manual
      // entry. Must be self-contained — no references to outer-scope variables.
      requestInterceptor: (req: { headers: Record<string, string> }) => {
        req.headers['x-timestamp'] = `${Date.now()}`;
        return req;
      },
    },
  });
}
