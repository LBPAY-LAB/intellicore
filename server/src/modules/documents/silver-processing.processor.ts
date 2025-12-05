import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SilverProcessingService } from './silver-processing.service';

export interface SilverProcessingJob {
  documentId: string;
}

@Processor('silver-processing')
export class SilverProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(SilverProcessingProcessor.name);

  constructor(
    private readonly silverProcessingService: SilverProcessingService,
  ) {
    super();
  }

  async process(job: Job<SilverProcessingJob>): Promise<any> {
    const { documentId } = job.data;

    this.logger.log(`Processing silver job ${job.id} for document: ${documentId}`);

    try {
      const result = await this.silverProcessingService.processDocument(documentId);

      this.logger.log(
        `Silver processing completed for document ${documentId}: ${result.chunksCreated} chunks, ${result.totalTokens} tokens`,
      );

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error(`Silver processing failed for document ${documentId}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SilverProcessingJob>) {
    const { documentId } = job.data;
    this.logger.log(`Silver job ${job.id} completed for document: ${documentId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SilverProcessingJob>, error: Error) {
    const { documentId } = job.data;
    this.logger.error(
      `Silver job ${job.id} failed for document ${documentId} (attempt ${job.attemptsMade}/${job.opts.attempts}):`,
      error,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<SilverProcessingJob>) {
    const { documentId } = job.data;
    this.logger.log(`Silver job ${job.id} started for document: ${documentId}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Silver job ${jobId} has stalled`);
  }
}
