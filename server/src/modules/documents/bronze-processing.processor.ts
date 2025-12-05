import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BronzeProcessingService } from './bronze-processing.service';
import { SilverProcessingService } from './silver-processing.service';
import { EmbeddingsService } from '../rag/embeddings.service';

export interface BronzeProcessingJob {
  documentId: string;
}

@Processor('bronze-processing')
export class BronzeProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(BronzeProcessingProcessor.name);

  constructor(
    private readonly bronzeProcessingService: BronzeProcessingService,
    private readonly silverProcessingService: SilverProcessingService,
    private readonly embeddingsService: EmbeddingsService,
  ) {
    super();
  }

  async process(job: Job<BronzeProcessingJob>): Promise<any> {
    const { documentId } = job.data;

    this.logger.log(`Processing job ${job.id} for document: ${documentId}`);

    try {
      // Process document through bronze layer
      const document = await this.bronzeProcessingService.processDocument(documentId);

      this.logger.log(
        `Bronze processing completed for document ${documentId}, queueing for silver processing`,
      );

      // After successful bronze processing, enqueue for silver layer processing
      try {
        await this.silverProcessingService.enqueueForSilverProcessing(documentId);
        this.logger.log(`Document ${documentId} enqueued for silver processing`);
      } catch (error) {
        this.logger.error(`Failed to enqueue document ${documentId} for silver processing:`, error);
        // Fallback to legacy embedding flow if silver processing fails
        try {
          await this.embeddingsService.enqueueDocumentEmbedding(documentId);
          this.logger.log(`Document ${documentId} enqueued for legacy embedding (fallback)`);
        } catch (embedError) {
          this.logger.error(`Failed to enqueue document ${documentId} for embedding:`, embedError);
        }
      }

      return {
        success: true,
        documentId,
        metadata: document.bronzeMetadata,
      };
    } catch (error) {
      this.logger.error(`Bronze processing failed for document ${documentId}:`, error);
      throw error; // Re-throw to trigger retry logic
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<BronzeProcessingJob>) {
    const { documentId } = job.data;
    this.logger.log(`Job ${job.id} completed for document: ${documentId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BronzeProcessingJob>, error: Error) {
    const { documentId } = job.data;
    this.logger.error(
      `Job ${job.id} failed for document ${documentId} (attempt ${job.attemptsMade}/${job.opts.attempts}):`,
      error,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<BronzeProcessingJob>) {
    const { documentId } = job.data;
    this.logger.log(`Job ${job.id} started for document: ${documentId}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Job ${jobId} has stalled`);
  }
}
