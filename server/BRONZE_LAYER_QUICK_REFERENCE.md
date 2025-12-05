# Bronze Layer Processing - Quick Reference Guide

## Overview
The Bronze Layer Processing Service extracts text and metadata from documents for RAG pipeline processing.

## GraphQL API

### Process Document for RAG
Triggers bronze layer processing for a document, extracting text and metadata.

```graphql
mutation ProcessDocumentForRag($documentId: String!) {
  processDocumentForRag(documentId: $documentId) {
    id
    originalFilename
    embeddingStatus
    extractedText
    bronzeProcessedAt
    bronzeMetadata
    embeddingError
  }
}
```

### Query Document Status
Check processing status and view extracted data.

```graphql
query GetDocument($id: String!) {
  document(id: $id) {
    id
    originalFilename
    mimeType
    fileSize
    embeddingStatus
    embeddingError
    bronzeProcessedAt
    bronzeMetadata
    extractedText
    embeddedAt
    createdAt
  }
}
```

## Processing Flow

```
User → processDocumentForRag mutation
  ↓
Queue job in BullMQ (bronze-processing)
  ↓
BronzeProcessingProcessor picks up job
  ↓
Download file from MinIO
  ↓
Extract text (PDF/Markdown/DOCX/Text)
  ↓
Extract metadata (title, author, date, version)
  ↓
Update document record
  ↓
Queue for embedding generation
  ↓
Return updated document
```

## Processing Status

| Status | Description |
|--------|-------------|
| `pending` | Document awaiting processing |
| `processing` | Currently being processed |
| `completed` | Processing completed successfully |
| `failed` | Processing failed (check embeddingError) |

## Bronze Metadata Fields

```json
{
  "title": "Document Title",
  "author": "Author Name",
  "date": "2025-12-04",
  "version": "1.0.0",
  "fileExtension": ".pdf",
  "wordCount": 1500,
  "charCount": 8500,
  "extractedAt": "2025-12-04T12:00:00.000Z"
}
```

## Supported File Types

| Type | MIME Type | Library |
|------|-----------|---------|
| PDF | `application/pdf` | pdf-parse |
| Markdown | `text/markdown` | Custom regex |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | mammoth |
| Plain Text | `text/plain` | UTF-8 decode |

## Example Usage

### 1. Upload and Process Document
```typescript
// 1. Get upload URL
const uploadUrl = await client.mutate({
  mutation: GET_UPLOAD_URL,
  variables: {
    input: {
      documentTypeId: 'type-uuid',
      filename: 'document.pdf',
      fileSize: 102400,
      contentType: 'application/pdf'
    }
  }
});

// 2. Upload file to presigned URL
await fetch(uploadUrl.data.getUploadPresignedUrl.uploadUrl, {
  method: 'PUT',
  body: fileBuffer,
  headers: { 'Content-Type': 'application/pdf' }
});

// 3. Confirm upload
const document = await client.mutate({
  mutation: CONFIRM_UPLOAD,
  variables: {
    input: {
      documentTypeId: 'type-uuid',
      fileKey: uploadUrl.data.getUploadPresignedUrl.fileKey,
      originalFilename: 'document.pdf',
      fileSize: 102400,
      mimeType: 'application/pdf'
    }
  }
});

// 4. Process for RAG
const processed = await client.mutate({
  mutation: PROCESS_DOCUMENT_FOR_RAG,
  variables: {
    documentId: document.data.confirmDocumentUpload.id
  }
});

// 5. Poll for completion
let status = 'processing';
while (status === 'processing') {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = await client.query({
    query: GET_DOCUMENT,
    variables: { id: document.data.confirmDocumentUpload.id }
  });

  status = result.data.document.embeddingStatus;
}

if (status === 'completed') {
  console.log('Processing completed!');
  console.log('Metadata:', result.data.document.bronzeMetadata);
} else {
  console.error('Processing failed:', result.data.document.embeddingError);
}
```

### 2. Programmatic Service Usage
```typescript
import { BronzeProcessingService } from './bronze-processing.service';

@Injectable()
export class MyService {
  constructor(
    private readonly bronzeProcessingService: BronzeProcessingService
  ) {}

  async processMyDocument(documentId: string) {
    // Queue for processing
    await this.bronzeProcessingService.enqueueDocumentProcessing(documentId);

    // Or process immediately (blocks)
    const document = await this.bronzeProcessingService.processDocument(documentId);

    console.log('Extracted text length:', document.extractedText?.length);
    console.log('Metadata:', document.bronzeMetadata);
  }

  async checkStatus(documentId: string) {
    const status = await this.bronzeProcessingService.getProcessingStatus(documentId);

    console.log('Status:', status.status);
    console.log('Processed at:', status.processedAt);
    console.log('Metadata:', status.metadata);
  }
}
```

## Error Handling

### Common Errors

**1. Document Not Found**
```json
{
  "errors": [{
    "message": "Document {id} not found"
  }]
}
```

**2. Text Extraction Failed**
```json
{
  "embeddingStatus": "failed",
  "embeddingError": "PDF extraction failed: Invalid PDF structure"
}
```

**3. No Text Extracted**
```json
{
  "embeddingStatus": "failed",
  "embeddingError": "No text could be extracted from document {id}"
}
```

### Retry Behavior
- **Attempts**: 3 total
- **Backoff**: Exponential (5s, 25s, 125s)
- **Retryable**: Network errors, temporary failures
- **Non-retryable**: Invalid documents, missing files

## Monitoring

### Key Log Messages
```
✅ Success:
- "Enqueuing document X for bronze processing"
- "Bronze processing completed for document: X"
- "Job X completed for document: Y"

❌ Errors:
- "Bronze processing failed for document X:"
- "Failed to extract text from [PDF/Markdown/DOCX]:"
- "Job X failed for document Y (attempt N/3):"
```

### Metrics to Track
- Processing success rate
- Average processing time per file type
- Queue depth (bronze-processing queue)
- Retry frequency
- Memory usage during processing

## Troubleshooting

### Issue: Document stuck in "processing"
**Solution**: Check BullMQ dashboard for stalled jobs

### Issue: Text extraction fails for PDFs
**Solution**:
1. Verify PDF is not corrupted
2. Check PDF version compatibility with pdf-parse
3. Try re-uploading the document

### Issue: Metadata not extracted
**Solution**:
- Metadata extraction uses pattern matching
- Not all documents contain extractable metadata
- Check bronzeMetadata field - partial metadata is OK

### Issue: Embedding queue not triggered
**Solution**:
- Bronze processing completes even if embedding queue fails
- Check EmbeddingsService logs
- Manually trigger embedding: Use existing RAG mutations

## Configuration

### Queue Configuration
Located in: `documents.module.ts`
```typescript
BullModule.registerQueue({
  name: 'bronze-processing'
})
```

### Retry Configuration
Located in: `bronze-processing.service.ts`
```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000
  }
}
```

## Database Schema

### New Columns
```sql
-- document_category_id: Link to document categories
document_category_id UUID NULL

-- bronze_processed_at: Timestamp of processing completion
bronze_processed_at TIMESTAMP WITH TIME ZONE NULL

-- bronze_metadata: Extracted metadata as JSON
bronze_metadata JSONB NULL

-- Index for category queries
CREATE INDEX idx_documents_document_category_id
ON documents(document_category_id);
```

## Performance Benchmarks

| File Type | Size | Processing Time |
|-----------|------|----------------|
| PDF | 10 pages | 2-3 seconds |
| PDF | 100 pages | 5-10 seconds |
| Markdown | 50KB | <1 second |
| DOCX | 50 pages | 2-4 seconds |

## Next Steps

After bronze processing completes:
1. Document automatically queued for embedding generation
2. EmbeddingsProcessor chunks text (512 tokens, 50 overlap)
3. Generates embeddings via Ollama
4. Stores vectors in Qdrant
5. Document ready for RAG queries

## API Complete Example

```graphql
# Complete workflow in GraphQL Playground

# Step 1: Get upload URL
mutation {
  getUploadPresignedUrl(input: {
    documentTypeId: "uuid-here"
    filename: "research-paper.pdf"
    fileSize: 1048576
    contentType: "application/pdf"
  }) {
    uploadUrl
    fileKey
    expiresIn
  }
}

# Step 2: Upload file (use REST client)
# PUT to uploadUrl with file content

# Step 3: Confirm upload
mutation {
  confirmDocumentUpload(input: {
    documentTypeId: "uuid-here"
    fileKey: "documents/1733270400000-abc123.pdf"
    originalFilename: "research-paper.pdf"
    fileSize: 1048576
    mimeType: "application/pdf"
  }) {
    id
    originalFilename
    embeddingStatus
  }
}

# Step 4: Process for RAG
mutation {
  processDocumentForRag(documentId: "doc-uuid-here") {
    id
    embeddingStatus
  }
}

# Step 5: Check status (repeat until completed)
query {
  document(id: "doc-uuid-here") {
    id
    originalFilename
    embeddingStatus
    embeddingError
    bronzeProcessedAt
    bronzeMetadata
    extractedText
  }
}
```

## Additional Resources

- **Implementation Details**: See `SPRINT_16_US-DB-003_IMPLEMENTATION.md`
- **BullMQ Documentation**: https://docs.bullmq.io/
- **RAG Pipeline**: See `/server/src/modules/rag/`
- **Document Types**: See `/server/src/modules/documents/document-types.service.ts`
