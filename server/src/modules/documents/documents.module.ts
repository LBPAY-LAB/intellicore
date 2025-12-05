import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { DocumentsService } from './documents.service';
import { DocumentTypesService } from './document-types.service';
import { DocumentCategoriesService } from './document-categories.service';
import { BronzeProcessingService } from './bronze-processing.service';
import { BronzeProcessingProcessor } from './bronze-processing.processor';
import { SilverProcessingService } from './silver-processing.service';
import { SilverProcessingProcessor } from './silver-processing.processor';
import { GoldDistributionService } from './gold-distribution.service';
import { GoldDistributionProcessor } from './gold-distribution.processor';
import { TrinoService } from './trino.service';
import { DocumentsResolver } from './documents.resolver';
import { DocumentTypesResolver } from './document-types.resolver';
import { DocumentCategoriesResolver } from './document-categories.resolver';
import { Document } from './entities/document.entity';
import { DocumentType } from './entities/document-type.entity';
import { DocumentCategory } from './entities/document-category.entity';
import { SilverChunk } from './entities/silver-chunk.entity';
import { GoldDistribution } from './entities/gold-distribution.entity';
import { StorageModule } from '../../storage/storage.module';
import { VectorModule } from '../../vector/vector.module';
import { RagModule } from '../rag/rag.module';
import { GraphQueryModule } from '../graph-query/graph-query.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      DocumentType,
      DocumentCategory,
      SilverChunk,
      GoldDistribution,
    ]),
    StorageModule,
    VectorModule,
    forwardRef(() => RagModule),
    forwardRef(() => GraphQueryModule),
    BullModule.registerQueue(
      { name: 'bronze-processing' },
      { name: 'silver-processing' },
      { name: 'gold-distribution' },
    ),
  ],
  providers: [
    DocumentsService,
    DocumentTypesService,
    DocumentCategoriesService,
    BronzeProcessingService,
    BronzeProcessingProcessor,
    SilverProcessingService,
    SilverProcessingProcessor,
    GoldDistributionService,
    GoldDistributionProcessor,
    TrinoService,
    DocumentsResolver,
    DocumentTypesResolver,
    DocumentCategoriesResolver,
  ],
  exports: [
    DocumentsService,
    DocumentTypesService,
    DocumentCategoriesService,
    BronzeProcessingService,
    SilverProcessingService,
    GoldDistributionService,
    TrinoService,
  ],
})
export class DocumentsModule {}
