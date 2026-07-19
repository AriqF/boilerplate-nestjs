import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { AppConfigService } from './config/app-config.service';
import { setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const config = app.get(AppConfigService);

  // Keep API docs off in production unless deliberately enabled.
  if (!config.isProduction) {
    setupSwagger(app);
  }

  await app.listen(config.port);
}

void bootstrap();
