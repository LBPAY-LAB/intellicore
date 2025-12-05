import { registerEnumType } from '@nestjs/graphql';

export enum EmbeddingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(EmbeddingStatus, {
  name: 'EmbeddingStatus',
  description: 'Status of document embedding process',
});
