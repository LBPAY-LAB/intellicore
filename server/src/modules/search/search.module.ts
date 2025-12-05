/**
 * SearchModule
 * Sprint 12 - US-057: Meilisearch Integration
 *
 * Module for Meilisearch-based full-text search functionality.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MeilisearchService } from './meilisearch.service';
import { InstanceSearchService } from './instance-search.service';
import { SearchResolver } from './search.resolver';
import { InstanceIndexListener } from './instance-index.listener';
import { InstanceEntity } from '../instances/entities/instance.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([InstanceEntity]),
  ],
  providers: [
    MeilisearchService,
    InstanceSearchService,
    SearchResolver,
    InstanceIndexListener,
  ],
  exports: [
    MeilisearchService,
    InstanceSearchService,
  ],
})
export class SearchModule {}
