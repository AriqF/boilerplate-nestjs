import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { PostgresConfig } from '../config/app-config.service';
import { buildPostgresOptions } from '../config/postgres.config';

/**
 * Standalone DataSource for the TypeORM CLI (migration:generate/run/revert). This runs
 * OUTSIDE Nest's DI, so it reads process.env directly instead of AppConfigService —
 * loaded via Node's built-in .env parser (no extra dependency). The connection *shape*
 * is still single-sourced through buildPostgresOptions; only the entity/migration globs
 * are CLI-specific (TS files, resolved by ts-node).
 */
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const cliConfig: PostgresConfig = {
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB ?? 'postgres',
  username: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.POSTGRES_SSL === 'true',
};

export default new DataSource({
  ...buildPostgresOptions(cliConfig),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
