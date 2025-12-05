import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { QdrantService } from '../../vector/qdrant.service';
import { EmbeddingsService } from './embeddings.service';
import { SemanticSearchInput } from './dto/semantic-search.input';

describe('RagService', () => {
  let service: RagService;
  let qdrantService: QdrantService;
  let embeddingsService: EmbeddingsService;

  const mockQdrantService = {
    searchVectors: jest.fn(),
    healthCheck: jest.fn(),
    countVectors: jest.fn(),
  };

  const mockEmbeddingsService = {
    generateEmbedding: jest.fn(),
    healthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        {
          provide: QdrantService,
          useValue: mockQdrantService,
        },
        {
          provide: EmbeddingsService,
          useValue: mockEmbeddingsService,
        },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
    qdrantService = module.get<QdrantService>(QdrantService);
    embeddingsService = module.get<EmbeddingsService>(EmbeddingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('semanticSearch', () => {
    const searchInput: SemanticSearchInput = {
      query: 'test query',
      limit: 10,
      scoreThreshold: 0.7,
    };

    const mockEmbedding = new Array(768).fill(0.1);

    const mockSearchResults = [
      {
        id: 'doc-1-chunk-0',
        score: 0.95,
        payload: {
          document_id: 'doc-1',
          document_type_id: 'type-1',
          document_type_name: 'Policy',
          original_filename: 'test.pdf',
          chunk_index: 0,
          chunk_text: 'Test content',
          start_offset: 0,
          end_offset: 12,
          token_count: 50,
          created_at: '2024-01-01T00:00:00Z',
        },
      },
    ];

    it('should perform semantic search successfully', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue(mockSearchResults);

      const result = await service.semanticSearch(searchInput);

      expect(result.results).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.query).toBe('test query');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.results[0].chunkId).toBe('doc-1-chunk-0');
      expect(result.results[0].score).toBe(0.95);

      expect(mockEmbeddingsService.generateEmbedding).toHaveBeenCalledWith('test query');
      expect(mockQdrantService.searchVectors).toHaveBeenCalledWith({
        vector: mockEmbedding,
        limit: 10,
        scoreThreshold: 0.7,
        filter: undefined,
      });
    });

    it('should apply document type filter when provided', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue([]);

      const inputWithFilter: SemanticSearchInput = {
        ...searchInput,
        documentTypeId: 'type-1',
      };

      await service.semanticSearch(inputWithFilter);

      expect(mockQdrantService.searchVectors).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { documentTypeId: 'type-1' },
        }),
      );
    });

    it('should use default values when not provided', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue([]);

      const minimalInput: SemanticSearchInput = {
        query: 'test',
      };

      await service.semanticSearch(minimalInput);

      expect(mockQdrantService.searchVectors).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          scoreThreshold: 0.7,
        }),
      );
    });

    it('should handle empty results', async () => {
      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue([]);

      const result = await service.semanticSearch(searchInput);

      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      mockEmbeddingsService.generateEmbedding.mockRejectedValue(
        new Error('Embedding generation failed'),
      );

      await expect(service.semanticSearch(searchInput)).rejects.toThrow(
        'Embedding generation failed',
      );
    });

    it('should transform multiple search results correctly', async () => {
      const multipleResults = [
        mockSearchResults[0],
        {
          ...mockSearchResults[0],
          id: 'doc-1-chunk-1',
          score: 0.85,
          payload: {
            ...mockSearchResults[0].payload,
            chunk_index: 1,
          },
        },
      ];

      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue(multipleResults);

      const result = await service.semanticSearch(searchInput);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].chunkIndex).toBe(0);
      expect(result.results[1].chunkIndex).toBe(1);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array for short queries', async () => {
      const suggestions = await service.getSearchSuggestions('ab');

      expect(suggestions).toEqual([]);
      expect(mockEmbeddingsService.generateEmbedding).not.toHaveBeenCalled();
    });

    it('should return suggestions for valid queries', async () => {
      const mockEmbedding = new Array(768).fill(0.1);
      const mockResults = [
        {
          id: 'doc-1-chunk-0',
          score: 0.8,
          payload: { original_filename: 'policy1.pdf' },
        },
        {
          id: 'doc-2-chunk-0',
          score: 0.75,
          payload: { original_filename: 'policy2.pdf' },
        },
      ];

      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue(mockResults);

      const suggestions = await service.getSearchSuggestions('policy', 5);

      expect(suggestions).toHaveLength(2);
      expect(suggestions).toContain('policy1.pdf');
      expect(suggestions).toContain('policy2.pdf');
    });

    it('should handle errors and return empty array', async () => {
      mockEmbeddingsService.generateEmbedding.mockRejectedValue(
        new Error('Failed'),
      );

      const suggestions = await service.getSearchSuggestions('test');

      expect(suggestions).toEqual([]);
    });

    it('should deduplicate filenames', async () => {
      const mockEmbedding = new Array(768).fill(0.1);
      const mockResults = [
        { id: '1', score: 0.8, payload: { original_filename: 'same.pdf' } },
        { id: '2', score: 0.75, payload: { original_filename: 'same.pdf' } },
        { id: '3', score: 0.7, payload: { original_filename: 'other.pdf' } },
      ];

      mockEmbeddingsService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.searchVectors.mockResolvedValue(mockResults);

      const suggestions = await service.getSearchSuggestions('test');

      expect(suggestions).toHaveLength(2);
      expect(suggestions).toContain('same.pdf');
      expect(suggestions).toContain('other.pdf');
    });
  });

  describe('healthCheck', () => {
    it('should check health of all services', async () => {
      mockQdrantService.healthCheck.mockResolvedValue(true);
      mockEmbeddingsService.healthCheck.mockResolvedValue(true);
      mockQdrantService.countVectors.mockResolvedValue(100);

      const health = await service.healthCheck();

      expect(health).toEqual({
        qdrant: true,
        ollama: true,
        vectorCount: 100,
      });
    });

    it('should report unhealthy services', async () => {
      mockQdrantService.healthCheck.mockResolvedValue(false);
      mockEmbeddingsService.healthCheck.mockResolvedValue(false);
      mockQdrantService.countVectors.mockResolvedValue(0);

      const health = await service.healthCheck();

      expect(health).toEqual({
        qdrant: false,
        ollama: false,
        vectorCount: 0,
      });
    });
  });
});
