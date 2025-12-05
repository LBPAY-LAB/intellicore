import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GoldDistributionService } from './gold-distribution.service';

export interface GoldDistributionJob {
  documentId: string;
}

@Processor('gold-distribution')
export class GoldDistributionProcessor extends WorkerHost {
  private readonly logger = new Logger(GoldDistributionProcessor.name);

  constructor(
    private readonly goldDistributionService: GoldDistributionService,
  ) {
    super();
  }

  async process(job: Job<GoldDistributionJob>): Promise<any> {
    const { documentId } = job.data;

    this.logger.log(`Processing gold distribution job ${job.id} for document: ${documentId}`);

    try {
      const result = await this.goldDistributionService.distributeDocument(documentId);

      this.logger.log(
        `Gold distribution completed for document ${documentId}: ` +
          `A=${result.goldAProcessed}/${result.goldAFailed}, ` +
          `B=${result.goldBProcessed}/${result.goldBFailed}, ` +
          `C=${result.goldCProcessed}/${result.goldCFailed}`,
      );

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error(`Gold distribution failed for document ${documentId}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<GoldDistributionJob>) {
    const { documentId } = job.data;
    this.logger.log(`Gold distribution job ${job.id} completed for document: ${documentId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<GoldDistributionJob>, error: Error) {
    const { documentId } = job.data;
    this.logger.error(
      `Gold distribution job ${job.id} failed for document ${documentId} (attempt ${job.attemptsMade}/${job.opts.attempts}):`,
      error,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<GoldDistributionJob>) {
    const { documentId } = job.data;
    this.logger.log(`Gold distribution job ${job.id} started for document: ${documentId}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Gold distribution job ${jobId} has stalled`);
  }
}
