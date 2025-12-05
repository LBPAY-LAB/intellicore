/**
 * DataLoader Module
 * Sprint 15 - US-073: Performance Optimization
 *
 * Provides DataLoader integration for N+1 query prevention in GraphQL resolvers.
 */

import { Module, Global } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';

@Global()
@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
