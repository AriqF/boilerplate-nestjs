import { DataSourceOptions } from 'typeorm';
import { PostgresConfig } from './app-config.service';

/**
 * Single source of truth for the PostgreSQL connection shape. Shared by the runtime
 * `TypeOrmModule` (which adds `autoLoadEntities`) and the standalone CLI `DataSource`
 * (which adds explicit entity/migration globs). `synchronize` is always false —
 * schema changes go through migrations only.
 */
export function buildPostgresOptions(cfg: PostgresConfig): DataSourceOptions {
  return {
    type: 'postgres',
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    username: cfg.username,
    password: cfg.password,
    ssl: cfg.ssl,
    synchronize: false,
  };
}
