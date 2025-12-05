import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmbeddingsService } from './embeddings.service';

@Processor('embeddings', {
  concurrency: 1, // Process one document at a time to avoid overloading Ollama
})
export class EmbeddingsProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingsProcessor.name);

  constructor(private readonly embeddingsService: EmbeddingsService) {
    super();
  }

  async process(job: Job<{ documentId: string }>): Promise<any> {
    const { documentId } = job.data;

    this.logger.log(`Processing embedding job for document: ${documentId}`);

    try {
      const result = await this.embeddingsService.processDocumentEmbedding(documentId);

      if (result.success) {
        this.logger.log(
          `Successfully processed ${result.chunksEmbedded} chunks for document: ${documentId}`,
        );
      } else {
        this.logger.error(
          `Failed to process document ${documentId}: ${result.error}`,
        );
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error processing embedding job for document ${documentId}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Embedding job ${job.id} completed for document: ${job.data.documentId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Embedding job ${job.id} failed for document ${job.data.documentId}:`,
      error,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Embedding job ${job.id} started for document: ${job.data.documentId}`);
  }
}
