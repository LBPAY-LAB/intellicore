/**
 * Cache Module
 * Sprint 15 - US-073: Performance Optimization
 *
 * Centralized caching with Redis/Valkey backend.
 */

import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          store: redisStore,
          host: redisHost,
          port: redisPort,
          ttl: isProduction ? 300 : 60, // 5 min prod, 1 min dev
          max: 1000, // Max items in cache
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
