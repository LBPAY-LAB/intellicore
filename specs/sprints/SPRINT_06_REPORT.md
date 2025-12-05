# Sprint 6 Completion Report: Document Upload & Storage

**Project:** LBPay intelliCore Meta-Modeling Platform
**Sprint:** Sprint 6 - Document Upload & Storage
**Lead Agent:** backend-architect
**Date:** December 3, 2025
**Status:** COMPLETED

---

## Executive Summary

Sprint 6 successfully implemented a comprehensive document management system for the intelliCore platform. The implementation includes S3-compatible storage via MinIO, manageable document types (not hardcoded), automatic text extraction from PDF/DOCX, presigned URLs for secure upload/download, and a complete frontend UI with drag-and-drop functionality.

---

## User Stories Completed

### US-027: Document Storage Setup (MinIO/S3) (Points: 5)

**Implementation:**
- MinIO container added to docker-compose.yml
- S3Service for object storage operations
- Presigned URL generation for uploads
- Presigned URL generation for downloads
- Bucket creation on startup
- File deletion support

**Files Created:**
- `server/src/storage/s3.service.ts` - MinIO/S3 client service
- `server/src/storage/storage.module.ts` - Storage module

**Docker Configuration:**
```yaml
minio:
  image: minio/minio:latest
  container_name: lbpay-minio
  ports:
    - "9000:9000"   # API
    - "9001:9001"   # Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
```

---

### US-027B: Document Type Entity (Manageable Categories) (Points: 3)

**Implementation:**
- DocumentTypeEntity with full CRUD
- Categories: BACEN Regulation, Internal Policy, Technical Manual, etc.
- Allowed file extensions per type
- Max file size per type
- Active/inactive status
- Seed data via migration

**Files Created:**
- `server/src/modules/documents/entities/document-type.entity.ts`
- `server/src/modules/documents/document-types.service.ts`
- `server/src/modules/documents/document-types.resolver.ts`
- `server/src/modules/documents/dto/create-document-type.input.ts`
- `server/src/modules/documents/dto/update-document-type.input.ts`

**Entity Fields:**
```typescript
{
  id: UUID,
  name: string,              // "Regulamentacao BACEN"
  description: string,
  allowed_extensions: string[], // [".pdf", ".docx"]
  max_file_size: number,     // bytes
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp,
  deleted_at: timestamp
}
```

**Seed Data:**
- Regulamentacao BACEN (PDF only, 50MB)
- Politica Interna (PDF/DOCX, 25MB)
- Manual Tecnico (PDF/DOCX/MD, 100MB)
- Contrato (PDF, 10MB)
- Outros (Any, 50MB)

---

### US-028: Document Entity & Repository (Points: 5)

**Implementation:**
- DocumentEntity with metadata
- Link to DocumentType
- Storage path and S3 key
- File metadata (size, mime type)
- Text extraction status
- Extracted text storage

**Files Created:**
- `server/src/modules/documents/entities/document.entity.ts`
- `server/src/modules/documents/dto/document.response.ts`

**Entity Fields:**
```typescript
{
  id: UUID,
  document_type_id: UUID,
  original_filename: string,
  s3_key: string,
  mime_type: string,
  file_size: number,
  extracted_text: text,
  extraction_status: enum,
  uploaded_by: UUID,
  is_active: boolean,
  created_at: timestamp,
  updated_at: timestamp,
  deleted_at: timestamp
}
```

---

### US-029: Document Upload Service (Points: 8)

**Implementation:**
- Two-step upload flow
- Presigned URL generation
- Upload confirmation with metadata
- Automatic text extraction
- PDF extraction via pdf-parse
- DOCX extraction via mammoth
- File validation per document type

**Files Created:**
- `server/src/modules/documents/documents.service.ts`
- `server/src/modules/documents/dto/initiate-upload.input.ts`
- `server/src/modules/documents/dto/confirm-upload.input.ts`
- `server/src/modules/documents/dto/presigned-url.response.ts`

**Upload Flow:**
```
1. Client → initiateUpload(filename, type_id)
   ← presignedUrl, s3Key

2. Client → S3 PUT with presignedUrl
   ← 200 OK

3. Client → confirmUpload(s3Key)
   ← Document entity (triggers text extraction)
```

**Text Extraction:**
- PDF: pdf-parse library
- DOCX: mammoth library
- Other: No extraction (stored as-is)
- Async extraction via queue (optional)

---

### US-030: Document Upload GraphQL API (Points: 5)

**Implementation:**
- Queries: documents, document, documentTypes
- Mutations: initiateUpload, confirmUpload, deleteDocument
- Mutations: createDocumentType, updateDocumentType, deleteDocumentType
- Presigned download URL query
- Authentication required

**Files Created:**
- `server/src/modules/documents/documents.resolver.ts`
- `server/src/modules/documents/documents.module.ts`
- `server/src/migrations/1733367000000-CreateDocumentTables.ts`

**GraphQL Schema:**
```graphql
type Document {
  id: ID!
  document_type: DocumentType!
  original_filename: String!
  mime_type: String!
  file_size: Int!
  extracted_text: String
  extraction_status: ExtractionStatus!
  created_at: DateTime!
}

type DocumentType {
  id: ID!
  name: String!
  description: String
  allowed_extensions: [String!]!
  max_file_size: Int!
  is_active: Boolean!
}

type Mutation {
  initiateUpload(input: InitiateUploadInput!): PresignedUrlResponse!
  confirmUpload(input: ConfirmUploadInput!): Document!
  deleteDocument(id: ID!): Boolean!
  createDocumentType(input: CreateDocumentTypeInput!): DocumentType!
  updateDocumentType(input: UpdateDocumentTypeInput!): DocumentType!
  deleteDocumentType(id: ID!): Boolean!
}
```

---

### US-031: Document Upload UI (Points: 5)

**Implementation:**
- Drag-and-drop upload zone
- File type selection
- Upload progress indicator
- Document list with filters
- Download button with presigned URL
- Delete confirmation
- Document type manager UI

**Files Created:**
- `client/lib/graphql/documents.ts` - GraphQL operations
- `client/hooks/useDocuments.ts` - Documents hook
- `client/hooks/useDocumentTypes.ts` - Document types hook
- `client/components/documents/DocumentUpload.tsx` - Upload component
- `client/components/documents/DocumentList.tsx` - List component
- `client/components/documents/DocumentTypeManager.tsx` - Type manager
- `client/app/[locale]/backoffice/documents/page.tsx` - Documents page

**UI Features:**
- Drag-and-drop zone with visual feedback
- File type validation before upload
- Size validation before upload
- Progress bar during upload
- Success/error toast notifications
- Filter by document type
- Sort by date, name, size
- Download with presigned URL
- Delete with confirmation

---

## Technical Achievements

### 1. MinIO Integration

```typescript
@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  async generatePresignedUploadUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async generatePresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

### 2. Text Extraction

```typescript
async extractText(s3Key: string, mimeType: string): Promise<string> {
  const buffer = await this.s3Service.getObject(s3Key);

  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (mimeType.includes('wordprocessingml')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return '';
}
```

### 3. File Validation

```typescript
validateFile(
  filename: string,
  fileSize: number,
  documentType: DocumentType
): void {
  const ext = path.extname(filename).toLowerCase();

  if (!documentType.allowed_extensions.includes(ext)) {
    throw new BadRequestException(
      `File extension ${ext} not allowed for ${documentType.name}`
    );
  }

  if (fileSize > documentType.max_file_size) {
    throw new BadRequestException(
      `File size exceeds maximum of ${documentType.max_file_size} bytes`
    );
  }
}
```

---

## Files Created Summary

### Backend (16 files)

**Entities:**
- `server/src/modules/documents/entities/document-type.entity.ts`
- `server/src/modules/documents/entities/document.entity.ts`

**DTOs:**
- `server/src/modules/documents/dto/create-document-type.input.ts`
- `server/src/modules/documents/dto/update-document-type.input.ts`
- `server/src/modules/documents/dto/initiate-upload.input.ts`
- `server/src/modules/documents/dto/confirm-upload.input.ts`
- `server/src/modules/documents/dto/presigned-url.response.ts`
- `server/src/modules/documents/dto/document.response.ts`

**Services:**
- `server/src/modules/documents/document-types.service.ts`
- `server/src/modules/documents/documents.service.ts`
- `server/src/storage/s3.service.ts`

**Resolvers:**
- `server/src/modules/documents/document-types.resolver.ts`
- `server/src/modules/documents/documents.resolver.ts`

**Modules:**
- `server/src/modules/documents/documents.module.ts`
- `server/src/storage/storage.module.ts`

**Migrations:**
- `server/src/migrations/1733367000000-CreateDocumentTables.ts`

### Frontend (7 files)

**GraphQL:**
- `client/lib/graphql/documents.ts`

**Hooks:**
- `client/hooks/useDocuments.ts`
- `client/hooks/useDocumentTypes.ts`

**Components:**
- `client/components/documents/DocumentUpload.tsx`
- `client/components/documents/DocumentList.tsx`
- `client/components/documents/DocumentTypeManager.tsx`

**Pages:**
- `client/app/[locale]/backoffice/documents/page.tsx`

---

## Key Implementation Decisions

### 1. Manageable Document Types
**Decision:** Document types are CRUD entities, not hardcoded enum
**Rationale:**
- User requested flexibility for BACEN and other document classifications
- Allows adding new types without code changes
- Each type has custom validation rules

### 2. Two-Step Upload
**Decision:** Use presigned URLs for direct S3 upload
**Rationale:**
- Reduces server load (files don't pass through backend)
- Better performance for large files
- Standard S3 pattern
- Secure with expiring URLs

### 3. Async Text Extraction
**Decision:** Extract text after upload confirmation
**Rationale:**
- Doesn't block upload response
- Can be moved to queue for large files
- Extraction status tracked in database

### 4. Soft Delete
**Decision:** Documents use soft delete
**Rationale:**
- Regulatory compliance (BACEN documents)
- Data recovery capability
- Audit trail

---

## Sprint Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| User Stories | 6 | 6 | 100% |
| Story Points | 31 | 31 | 100% |
| Backend Files | 15+ | 16 | Exceeded |
| Frontend Files | 5+ | 7 | Exceeded |
| TypeScript Strict | Yes | Yes | Success |
| i18n Complete | Yes | Yes | Success |

---

## Known Limitations

1. **Large File Extraction:** PDF extraction may timeout for very large files
2. **No OCR:** Scanned PDFs without text layer not supported
3. **No Virus Scanning:** Files not scanned for malware
4. **Single Bucket:** All documents in same bucket

---

## Future Enhancements

1. **OCR Support:** Tesseract integration for scanned documents
2. **Virus Scanning:** ClamAV integration
3. **Version Control:** Document versioning
4. **Preview:** PDF/image preview in browser
5. **Bulk Upload:** Multiple file upload
6. **Folder Structure:** Organize documents in folders

---

## Conclusion

Sprint 6 successfully delivered a comprehensive document management system that enables users to upload, categorize, and manage regulatory documents (BACEN) and other document types. The system follows best practices for S3/MinIO integration, provides automatic text extraction for RAG indexing in Sprint 7, and includes a complete frontend UI.

**Key Achievements:**
- MinIO S3-compatible storage integration
- Manageable document types with validation rules
- Two-step secure upload with presigned URLs
- Automatic text extraction from PDF and DOCX
- Complete CRUD for document types and documents
- Drag-and-drop upload UI with progress
- Full i18n support (pt-BR, en-US, es-ES)

**Ready for Sprint 7:** RAG Indexing & Semantic Search

---

**Report Prepared By:** backend-architect (Claude Agent SDK)
**Date:** December 3, 2025
**Sprint Status:** COMPLETED
