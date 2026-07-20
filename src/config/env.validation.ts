import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Schema for all environment variables. Defaults keep the app bootable with zero
 * config in development; types are validated strictly so a malformed value fails fast.
 */
export class EnvConfig {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST = 'localhost';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST = 'localhost';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  POSTGRES_PORT = 5432;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB = 'postgres';

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER = 'postgres';

  @IsOptional()
  @IsString()
  POSTGRES_PASSWORD?: string;

  /** Enable TLS to the database (managed providers usually require it). */
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  POSTGRES_SSL = false;

  /** Comma-separated accepted API keys. Read as an array via AppConfigService. */
  @IsString()
  API_KEYS = '';

  /** Max allowed clock skew (seconds) for the x-timestamp header. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  API_TIMESTAMP_TOLERANCE_SEC = 300;
}

/**
 * ConfigModule `validate` hook: coerce + validate process.env against EnvConfig.
 * Throws (aborting boot) with a readable message when anything is invalid.
 */
export function validate(config: Record<string, unknown>): EnvConfig {
  const validated = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n');
    throw new Error(`Environment validation failed:\n${details}`);
  }

  return validated;
}
