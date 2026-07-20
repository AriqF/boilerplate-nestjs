import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/app-config.service';
import { buildPostgresOptions } from '../config/postgres.config';

/**
 * Wires the global TypeORM connection from the central Postgres config. Entities are
 * discovered via `autoLoadEntities` (feature modules register them with
 * `TypeOrmModule.forFeature`), so there is no runtime entity glob. Migrations are run
 * explicitly through the CLI (`migrationsRun: false`), never on boot.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        ...buildPostgresOptions(config.postgres),
        autoLoadEntities: true,
        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
