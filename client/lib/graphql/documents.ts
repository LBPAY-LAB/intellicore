import { gql } from '@apollo/client';

// Document Category Fragments
export const DOCUMENT_CATEGORY_FRAGMENT = gql`
  fragment DocumentCategoryFields on DocumentCategory {
    id
    name
    description
    targetGoldLayers
    isActive
  }
`;

// Document Type Fragments
export const DOCUMENT_TYPE_FRAGMENT = gql`
  fragment DocumentTypeFields on DocumentType {
    id
    name
    description
    allowedExtensions
    maxFileSizeMb
    isActive
    createdAt
    updatedAt
  }
`;

// Document Fragments
export const DOCUMENT_FRAGMENT = gql`
  fragment DocumentFields on Document {
    id
    documentTypeId
    documentCategoryId
    originalFilename
    storedFilename
    fileKey
    fileSize
    mimeType
    s3Bucket
    extractedText
    isProcessed
    embeddingStatus
    embeddingError
    bronzeProcessedAt
    bronzeMetadata
    uploadedBy
    createdAt
    updatedAt
    documentType {
      ...DocumentTypeFields
    }
    documentCategory {
      ...DocumentCategoryFields
    }
  }
  ${DOCUMENT_TYPE_FRAGMENT}
  ${DOCUMENT_CATEGORY_FRAGMENT}
`;

// Document Type Queries
export const GET_DOCUMENT_TYPES = gql`
  query GetDocumentTypes {
    documentTypes {
      ...DocumentTypeFields
    }
  }
  ${DOCUMENT_TYPE_FRAGMENT}
`;

export const GET_ACTIVE_DOCUMENT_TYPES = gql`
  query GetActiveDocumentTypes {
    activeDocumentTypes {
      ...DocumentTypeFields
    }
  }
  ${DOCUMENT_TYPE_FRAGMENT}
`;

export const GET_DOCUMENT_TYPE = gql`
  query GetDocumentType($id: ID!) {
    documentType(id: $id) {
      ...DocumentTypeFields
    }
  }
  ${DOCUMENT_TYPE_FRAGMENT}
`;

// Document Type Mutations
export const CREATE_DOCUMENT_TYPE = gql`
  mutation CreateDocumentType($input: CreateDocumentTypeInput!) {
    createDocumentType(input: $input) {
      ...DocumentTypeFields
    }
  }
  ${DOCUMENT_TYPE_FRAGMENT}
`;

export const UPDATE_DOCUMENT_TYPE = gql`
  mutation UpdateDocumentType($input: UpdateDocumentTypeInput!) {
    updateDocumentType(input: $input) {
      ...DocumentTypeFields
    }
  }
  ${DOCUMENT_TYPE_FRAGMENT}
`;

export const DELETE_DOCUMENT_TYPE = gql`
  mutation DeleteDocumentType($id: ID!) {
    deleteDocumentType(id: $id)
  }
`;

// Document Queries
export const GET_DOCUMENTS = gql`
  query GetDocuments($filter: DocumentsFilterInput) {
    documents(filter: $filter) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FRAGMENT}
`;

export const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      ...DocumentFields
      downloadUrl
    }
  }
  ${DOCUMENT_FRAGMENT}
`;

// Document Mutations
export const GET_UPLOAD_PRESIGNED_URL = gql`
  mutation GetUploadPresignedUrl($input: GetUploadPresignedUrlInput!) {
    getUploadPresignedUrl(input: $input) {
      uploadUrl
      fileKey
      expiresIn
    }
  }
`;

export const CONFIRM_DOCUMENT_UPLOAD = gql`
  mutation ConfirmDocumentUpload($input: ConfirmDocumentUploadInput!) {
    confirmDocumentUpload(input: $input) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FRAGMENT}
`;

export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

// Document Category Queries
export const GET_ACTIVE_DOCUMENT_CATEGORIES = gql`
  query GetActiveDocumentCategories {
    activeDocumentCategories {
      ...DocumentCategoryFields
    }
  }
  ${DOCUMENT_CATEGORY_FRAGMENT}
`;

// Document RAG Processing Mutation
export const PROCESS_DOCUMENT_FOR_RAG = gql`
  mutation ProcessDocumentForRag($documentId: ID!) {
    processDocumentForRag(documentId: $documentId) {
      ...DocumentFields
    }
  }
  ${DOCUMENT_FRAGMENT}
`;

// Silver Layer Queries (Sprint 18)
export const GET_DOCUMENT_SILVER_CHUNKS = gql`
  query GetDocumentSilverChunks($documentId: ID!) {
    documentSilverChunks(documentId: $documentId) {
      id
      chunkIndex
      content
      tokenCount
      pageNumber
      hasTable
      hasImage
      sectionHierarchy
      extractedEntities
      processingStatus
      errorMessage
      createdAt
    }
  }
`;

// Gold Distribution Queries (Sprint 18)
export const GET_DOCUMENT_GOLD_DISTRIBUTIONS = gql`
  query GetDocumentGoldDistributions($documentId: ID!) {
    documentGoldDistributions(documentId: $documentId) {
      id
      goldAStatus
      goldARecordId
      goldADistributedAt
      goldBStatus
      goldBNodeId
      goldBDistributedAt
      goldCStatus
      goldCVectorId
      goldCDistributedAt
      createdAt
    }
  }
`;

export const GET_DOCUMENT_PROCESSING_STATS = gql`
  query GetDocumentProcessingStats($documentId: ID!) {
    documentProcessingStats(documentId: $documentId) {
      total
      goldA {
        completed
        pending
        failed
        skipped
      }
      goldB {
        completed
        pending
        failed
        skipped
      }
      goldC {
        completed
        pending
        failed
        skipped
      }
    }
  }
`;

// Retry Failed Gold Distribution Mutation (Sprint 18)
export const RETRY_FAILED_GOLD_DISTRIBUTION = gql`
  mutation RetryFailedGoldDistribution($documentId: ID!) {
    retryFailedGoldDistribution(documentId: $documentId)
  }
`;

// TypeScript Types
export enum GoldLayer {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum EmbeddingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  targetGoldLayers: GoldLayer[];
  isActive: boolean;
}
export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  allowedExtensions: string[];
  maxFileSizeMb: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  documentTypeId: string;
  documentCategoryId?: string;
  originalFilename: string;
  storedFilename: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  s3Bucket: string;
  extractedText?: string;
  isProcessed: boolean;
  embeddingStatus: EmbeddingStatus;
  embeddingError?: string;
  bronzeProcessedAt?: string;
  bronzeMetadata?: any;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  documentType: DocumentType;
  documentCategory?: DocumentCategory;
  downloadUrl?: string;
}

export interface CreateDocumentTypeInput {
  name: string;
  description?: string;
  allowedExtensions: string[];
  maxFileSizeMb: number;
}

export interface UpdateDocumentTypeInput {
  id: string;
  name?: string;
  description?: string;
  allowedExtensions?: string[];
  maxFileSizeMb?: number;
  isActive?: boolean;
}

export interface GetUploadPresignedUrlInput {
  documentTypeId: string;
  filename: string;
  contentType: string;
  fileSize: number;
}

export interface UploadPresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface ConfirmDocumentUploadInput {
  documentTypeId: string;
  documentCategoryId?: string;
  fileKey: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentsFilterInput {
  documentTypeId?: string;
  documentCategoryId?: string;
  embeddingStatus?: EmbeddingStatus;
  limit?: number;
  offset?: number;
}

// Sprint 18 Types - Silver Layer
export enum SilverProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ExtractedEntity {
  type: string;
  value: string;
  normalizedValue: string;
  startOffset: number;
  endOffset: number;
  confidence: number;
}

export interface SilverChunk {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  pageNumber?: number;
  hasTable: boolean;
  hasImage: boolean;
  sectionHierarchy: string[];
  extractedEntities: ExtractedEntity[];
  processingStatus: SilverProcessingStatus;
  errorMessage?: string;
  createdAt: string;
}

// Sprint 18 Types - Gold Distribution
export enum GoldDistributionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface GoldDistribution {
  id: string;
  goldAStatus: GoldDistributionStatus;
  goldARecordId?: string;
  goldADistributedAt?: string;
  goldBStatus: GoldDistributionStatus;
  goldBNodeId?: string;
  goldBDistributedAt?: string;
  goldCStatus: GoldDistributionStatus;
  goldCVectorId?: string;
  goldCDistributedAt?: string;
  createdAt: string;
}

export interface GoldLayerStats {
  completed: number;
  pending: number;
  failed: number;
  skipped: number;
}

export interface DocumentProcessingStats {
  total: number;
  goldA: GoldLayerStats;
  goldB: GoldLayerStats;
  goldC: GoldLayerStats;
}
