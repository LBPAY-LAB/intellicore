import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QdrantService, VectorPoint } from './qdrant.service';

describe('QdrantService', () => {
  let service: QdrantService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        QDRANT_HOST: 'localhost',
        QDRANT_PORT: 6333,
        QDRANT_COLLECTION_NAME: 'test_collection',
        EMBEDDING_DIMENSIONS: 768,
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QdrantService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QdrantService>(QdrantService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(configService.get).toHaveBeenCalledWith('QDRANT_HOST', 'localhost');
      expect(configService.get).toHaveBeenCalledWith('QDRANT_PORT', 6333);
      expect(configService.get).toHaveBeenCalledWith(
        'QDRANT_COLLECTION_NAME',
        'document_embeddings',
      );
      expect(configService.get).toHaveBeenCalledWith('EMBEDDING_DIMENSIONS', 768);
    });
  });

  describe('healthCheck', () => {
    it('should return true when Qdrant is healthy', async () => {
      // Mock successful health check
      const getCollectionsSpy = jest
        .spyOn(service['client'], 'getCollections')
        .mockResolvedValue({ collections: [] } as any);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(getCollectionsSpy).toHaveBeenCalled();
    });

    it('should return false when Qdrant is unhealthy', async () => {
      // Mock failed health check
      jest
        .spyOn(service['client'], 'getCollections')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('upsertVectors', () => {
    it('should upsert vectors successfully', async () => {
      const points: VectorPoint[] = [
        {
          id: 'test-1',
          vector: new Array(768).fill(0.1),
          payload: { document_id: 'doc-1', chunk_index: 0 },
        },
      ];

      const upsertSpy = jest
        .spyOn(service['client'], 'upsert')
        .mockResolvedValue({ status: 'completed' } as any);

      await service.upsertVectors(points);

      expect(upsertSpy).toHaveBeenCalledWith('test_collection', {
        wait: true,
        points: expect.arrayContaining([
          expect.objectContaining({
            id: 'test-1',
            vector: expect.any(Array),
            payload: expect.any(Object),
          }),
        ]),
      });
    });

    it('should throw error when upsert fails', async () => {
      const points: VectorPoint[] = [
        {
          id: 'test-1',
          vector: new Array(768).fill(0.1),
          payload: { document_id: 'doc-1' },
        },
      ];

      jest
        .spyOn(service['client'], 'upsert')
        .mockRejectedValue(new Error('Upsert failed'));

      await expect(service.upsertVectors(points)).rejects.toThrow('Upsert failed');
    });
  });

  describe('searchVectors', () => {
    it('should search vectors with default parameters', async () => {
      const searchVector = new Array(768).fill(0.1);
      const mockResults = [
        {
          id: 'test-1',
          score: 0.95,
          payload: { document_id: 'doc-1', text: 'test content' },
        },
      ];

      const searchSpy = jest
        .spyOn(service['client'], 'search')
        .mockResolvedValue(mockResults as any);

      const results = await service.searchVectors({ vector: searchVector });

      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(0.95);
      expect(searchSpy).toHaveBeenCalledWith('test_collection', {
        vector: searchVector,
        limit: 10,
        score_threshold: 0.7,
        filter: undefined,
        with_payload: true,
      });
    });

    it('should search vectors with custom parameters', async () => {
      const searchVector = new Array(768).fill(0.1);
      const mockResults = [
        {
          id: 'test-1',
          score: 0.85,
          payload: { document_id: 'doc-1' },
        },
      ];

      jest
        .spyOn(service['client'], 'search')
        .mockResolvedValue(mockResults as any);

      const results = await service.searchVectors({
        vector: searchVector,
        limit: 5,
        scoreThreshold: 0.8,
      });

      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(0.85);
    });

    it('should apply filters when searching', async () => {
      const searchVector = new Array(768).fill(0.1);
      const mockResults: any[] = [];

      const searchSpy = jest
        .spyOn(service['client'], 'search')
        .mockResolvedValue(mockResults);

      await service.searchVectors({
        vector: searchVector,
        filter: { documentTypeId: 'type-1' },
      });

      expect(searchSpy).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          filter: expect.objectContaining({
            must: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('deleteVectors', () => {
    it('should delete vectors by IDs', async () => {
      const ids = ['test-1', 'test-2'];

      const deleteSpy = jest
        .spyOn(service['client'], 'delete')
        .mockResolvedValue({ status: 'completed' } as any);

      await service.deleteVectors(ids);

      expect(deleteSpy).toHaveBeenCalledWith('test_collection', {
        wait: true,
        points: ids,
      });
    });
  });

  describe('deleteVectorsByDocumentId', () => {
    it('should delete vectors by document ID', async () => {
      const documentId = 'doc-1';

      const deleteSpy = jest
        .spyOn(service['client'], 'delete')
        .mockResolvedValue({ status: 'completed' } as any);

      await service.deleteVectorsByDocumentId(documentId);

      expect(deleteSpy).toHaveBeenCalledWith('test_collection', {
        wait: true,
        filter: {
          must: [
            {
              key: 'document_id',
              match: { value: documentId },
            },
          ],
        },
      });
    });
  });

  describe('countVectors', () => {
    it('should return vector count', async () => {
      const mockInfo = { points_count: 100 };

      jest
        .spyOn(service['client'], 'getCollection')
        .mockResolvedValue(mockInfo as any);

      const count = await service.countVectors();

      expect(count).toBe(100);
    });

    it('should return 0 when points_count is undefined', async () => {
      jest
        .spyOn(service['client'], 'getCollection')
        .mockResolvedValue({} as any);

      const count = await service.countVectors();

      expect(count).toBe(0);
    });
  });
});
