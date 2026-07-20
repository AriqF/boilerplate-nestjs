import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AppConfigModule } from './config/app-config.module';
import { AppCacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { NotesModule } from './notes/notes.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    DatabaseModule,
    RedisModule,
    AppCacheModule,
    QueueModule,
    NotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
