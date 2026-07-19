import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig, NodeEnv } from './env.validation';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * Typed, single source of truth for reading configuration. Feature code injects this
 * instead of touching `process.env` or `ConfigService` directly (parsing lives here once).
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  get nodeEnv(): NodeEnv {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === NodeEnv.Production;
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get redis(): RedisConfig {
    return {
      host: this.config.get('REDIS_HOST', { infer: true }),
      port: this.config.get('REDIS_PORT', { infer: true }),
      password: this.config.get('REDIS_PASSWORD', { infer: true }),
    };
  }

  get apiKeys(): string[] {
    return this.config
      .get('API_KEYS', { infer: true })
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);
  }

  get apiTimestampToleranceSec(): number {
    return this.config.get('API_TIMESTAMP_TOLERANCE_SEC', { infer: true });
  }
}
