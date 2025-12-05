import { Resolver, Query, Mutation, Args, ResolveField, Parent, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { BronzeProcessingService } from './bronze-processing.service';
import { SilverProcessingService } from './silver-processing.service';
import { GoldDistributionService } from './gold-distribution.service';
import { Document } from './entities/document.entity';
import { SilverChunk } from './entities/silver-chunk.entity';
import { GoldDistribution } from './entities/gold-distribution.entity';
import {
  GetUploadPresignedUrlInput,
  ConfirmDocumentUploadInput,
} from './dto/upload-document.input';
import { UploadPresignedUrlResponse } from './dto/document.response';
import { DocumentsFilterInput } from './dto/documents-filter.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
}

@ObjectType()
class GoldLayerStats {
  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Int)
  skipped: number;
}

@ObjectType()
class DocumentProcessingStats {
  @Field(() => Int)
  total: number;

  @Field(() => GoldLayerStats)
  goldA: GoldLayerStats;

  @Field(() => GoldLayerStats)
  goldB: GoldLayerStats;

  @Field(() => GoldLayerStats)
  goldC: GoldLayerStats;
}

@Resolver(() => Document)
@UseGuards(JwtAuthGuard)
export class DocumentsResolver {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly bronzeProcessingService: BronzeProcessingService,
    private readonly silverProcessingService: SilverProcessingService,
    private readonly goldDistributionService: GoldDistributionService,
  ) {}

  @Mutation(() => UploadPresignedUrlResponse)
  async getUploadPresignedUrl(
    @Args('input') input: GetUploadPresignedUrlInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<UploadPresignedUrlResponse> {
    return this.documentsService.getUploadPresignedUrl(input, user.sub);
  }

  @Mutation(() => Document)
  async confirmDocumentUpload(
    @Args('input') input: ConfirmDocumentUploadInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<Document> {
    return this.documentsService.confirmDocumentUpload(input, user.sub);
  }

  @Query(() => [Document], { name: 'documents' })
  async findAll(
    @Args('filter', { nullable: true }) filter?: DocumentsFilterInput,
  ): Promise<Document[]> {
    return this.documentsService.findAll(filter || {});
  }

  @Query(() => Document, { name: 'document' })
  async findOne(@Args('id') id: string): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Mutation(() => Boolean)
  async deleteDocument(@Args('id') id: string): Promise<boolean> {
    await this.documentsService.remove(id);
    return true;
  }

  @ResolveField('downloadUrl', () => String)
  async downloadUrl(@Parent() document: Document): Promise<string> {
    return this.documentsService.getDownloadUrl(document.id);
  }

  @Mutation(() => Document)
  async processDocumentForRag(@Args('documentId') documentId: string): Promise<Document> {
    await this.bronzeProcessingService.enqueueDocumentProcessing(documentId);
    return this.documentsService.findOne(documentId);
  }

  // Silver Layer operations
  @Mutation(() => Boolean)
  async triggerSilverProcessing(@Args('documentId') documentId: string): Promise<boolean> {
    await this.silverProcessingService.enqueueForSilverProcessing(documentId);
    return true;
  }

  @Query(() => [SilverChunk], { name: 'documentSilverChunks' })
  async getDocumentChunks(@Args('documentId') documentId: string): Promise<SilverChunk[]> {
    return this.silverProcessingService.getDocumentChunks(documentId);
  }

  // Gold Distribution operations
  @Query(() => [GoldDistribution], { name: 'documentGoldDistributions' })
  async getGoldDistributions(@Args('documentId') documentId: string): Promise<GoldDistribution[]> {
    return this.goldDistributionService.getDistributionSummary(documentId).then(async () => {
      return this.silverProcessingService.getGoldDistributionStatus(documentId);
    });
  }

  @Query(() => DocumentProcessingStats, { name: 'documentProcessingStats' })
  async getProcessingStats(@Args('documentId') documentId: string): Promise<DocumentProcessingStats> {
    return this.goldDistributionService.getDistributionSummary(documentId);
  }

  @Mutation(() => Boolean)
  async retryFailedGoldDistribution(@Args('documentId') documentId: string): Promise<boolean> {
    await this.goldDistributionService.retryFailedDistributions(documentId);
    return true;
  }
}
