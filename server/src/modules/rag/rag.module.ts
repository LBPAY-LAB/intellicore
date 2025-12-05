import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Document } from '../documents/entities/document.entity';
import { VectorModule } from '../../vector/vector.module';
import { ChunkingService } from './chunking.service';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingsProcessor } from './embeddings.processor';
import { RagService } from './rag.service';
import { RagResolver } from './rag.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    VectorModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'embeddings',
    }),
  ],
  providers: [
    ChunkingService,
    EmbeddingsService,
    EmbeddingsProcessor,
    RagService,
    RagResolver,
  ],
  exports: [ChunkingService, EmbeddingsService, RagService],
})
export class RagModule {}
