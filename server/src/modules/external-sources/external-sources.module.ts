/**
 * ExternalSourcesModule
 * Sprint 18 - US-DB-013/014/015: External Data Sources Management
 */

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ExternalSource } from './entities/external-source.entity';
import { ExternalSourcesService } from './external-sources.service';
import { ExternalSourcesResolver } from './external-sources.resolver';
import { Document } from '../documents/entities/document.entity';
import { DocumentType } from '../documents/entities/document-type.entity';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExternalSource, Document, DocumentType]),
    ConfigModule,
    forwardRef(() => RagModule),
  ],
  providers: [ExternalSourcesService, ExternalSourcesResolver],
  exports: [ExternalSourcesService],
})
export class ExternalSourcesModule {}
