import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { EmbeddingsService } from './embeddings.service';
import { Document } from '../documents/entities/document.entity';
import { QdrantService } from '../../vector/qdrant.service';
import { ChunkingService } from './chunking.service';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;
  let documentRepository: Repository<Document>;
  let qdrantService: QdrantService;
  let chunkingService: ChunkingService;
  let embeddingQueue: any;

  const mockDocumentRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockQdrantService = {
    upsertVectors: jest.fn(),
    deleteVectorsByDocumentId: jest.fn(),
    searchVectors: jest.fn(),
  };

  const mockChunkingService = {
    chunkText: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        OLLAMA_HOST: 'localhost',
        OLLAMA_PORT: 11434,
        OLLAMA_EMBEDDING_MODEL: 'nomic-embed-text',
        EMBEDDING_DIMENSIONS: 768,
      };
      return config[key] ?? defaultValue;
    }),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: QdrantService,
          useValue: mockQdrantService,
        },
        {
          provide: ChunkingService,
          useValue: mockChunkingService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getQueueToken('embeddings'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmbeddingsService>(EmbeddingsService);
    documentRepository = module.get(getRepositoryToken(Document));
    qdrantService = module.get<QdrantService>(QdrantService);
    chunkingService = module.get<ChunkingService>(ChunkingService);
    embeddingQueue = module.get(getQueueToken('embeddings'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      const mockEmbedding = new Array(768).fill(0.1);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding: mockEmbedding }),
      } as Response);

      const result = await service.generateEmbedding('test text');

      expect(result).toEqual(mockEmbedding);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/embeddings',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test text'),
        }),
      );
    });

    it('should throw error on API failure', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      await expect(service.generateEmbedding('test')).rejects.toThrow();
    });

    it('should throw error on invalid response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      } as Response);

      await expect(service.generateEmbedding('test')).rejects.toThrow(
        'Invalid embedding response',
      );
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const mockEmbedding = new Array(768).fill(0.1);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding: mockEmbedding }),
      } as Response);

      const texts = ['text1', 'text2', 'text3'];
      const results = await service.generateBatchEmbeddings(texts);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(mockEmbedding);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should process texts in batches', async () => {
      const mockEmbedding = new Array(768).fill(0.1);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding: mockEmbedding }),
      } as Response);

      const texts = new Array(15).fill('test text');
      await service.generateBatchEmbeddings(texts);

      expect(fetch).toHaveBeenCalledTimes(15);
    });
  });

  describe('enqueueDocumentEmbedding', () => {
    it('should enqueue document for embedding', async () => {
      await service.enqueueDocumentEmbedding('doc-1');

      expect(embeddingQueue.add).toHaveBeenCalledWith(
        'embed-document',
        { documentId: 'doc-1' },
        expect.objectContaining({
          attempts: 3,
          backoff: expect.any(Object),
        }),
      );
    });
  });

  describe('processDocumentEmbedding', () => {
    const mockDocument: any = {
      id: 'doc-1',
      documentTypeId: 'type-1',
      extractedText: 'This is test content. '.repeat(100),
      originalFilename: 'test.pdf',
      createdAt: new Date(),
      documentType: {
        name: 'Policy',
      },
    };

    const mockChunks = [
      {
        text: 'Chunk 1 content',
        chunkIndex: 0,
        startOffset: 0,
        endOffset: 15,
        tokenCount: 50,
      },
      {
        text: 'Chunk 2 content',
        chunkIndex: 1,
        startOffset: 15,
        endOffset: 30,
        tokenCount: 50,
      },
    ];

    it('should process document embedding successfully', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockChunkingService.chunkText.mockReturnValue(mockChunks);

      const mockEmbedding = new Array(768).fill(0.1);
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding: mockEmbedding }),
      } as Response);

      const result = await service.processDocumentEmbedding('doc-1');

      expect(result.success).toBe(true);
      expect(result.chunksEmbedded).toBe(2);
      expect(mockDocumentRepository.update).toHaveBeenCalledWith('doc-1', {
        embeddingStatus: 'completed',
        embeddedAt: expect.any(Date),
        embeddingError: null,
      });
      expect(mockQdrantService.upsertVectors).toHaveBeenCalled();
    });

    it('should handle document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      const result = await service.processDocumentEmbedding('doc-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(mockDocumentRepository.update).toHaveBeenCalledWith(
        'doc-1',
        expect.objectContaining({
          embeddingStatus: 'failed',
        }),
      );
    });

    it('should handle missing extracted text', async () => {
      mockDocumentRepository.findOne.mockResolvedValue({
        ...mockDocument,
        extractedText: null,
      });

      const result = await service.processDocumentEmbedding('doc-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('no extracted text');
    });

    it('should handle chunking errors', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);
      mockChunkingService.chunkText.mockReturnValue([]);

      const result = await service.processDocumentEmbedding('doc-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid chunks');
    });
  });

  describe('reEmbedDocument', () => {
    it('should re-embed document', async () => {
      await service.reEmbedDocument('doc-1');

      expect(mockQdrantService.deleteVectorsByDocumentId).toHaveBeenCalledWith('doc-1');
      expect(mockDocumentRepository.update).toHaveBeenCalledWith(
        'doc-1',
        expect.objectContaining({
          embeddingStatus: 'pending',
        }),
      );
      expect(embeddingQueue.add).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true when Ollama is healthy', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      } as Response);

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when Ollama is unhealthy', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('getDocumentEmbeddingStats', () => {
    it('should return embedding stats for document', async () => {
      const mockDoc: any = {
        id: 'doc-1',
        embeddingStatus: 'completed',
        embeddedAt: new Date(),
        embeddingError: null,
      };

      mockDocumentRepository.findOne.mockResolvedValue(mockDoc);
      mockQdrantService.searchVectors.mockResolvedValue([]);

      const stats = await service.getDocumentEmbeddingStats('doc-1');

      expect(stats.document_id).toBe('doc-1');
      expect(stats.embedding_status).toBe('completed');
    });

    it('should throw error for non-existent document', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(service.getDocumentEmbeddingStats('doc-1')).rejects.toThrow(
        'not found',
      );
    });
  });
});
