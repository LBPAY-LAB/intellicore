import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { DocumentTypesService } from './document-types.service';
import { S3Service } from '../../storage/s3.service';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;
  let documentTypesService: DocumentTypesService;
  let s3Service: S3Service;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDocumentTypesService = {
    validateFile: jest.fn(),
    findOne: jest.fn(),
  };

  const mockS3Service = {
    generateFileKey: jest.fn(),
    generateUploadPresignedUrl: jest.fn(),
    generateDownloadPresignedUrl: jest.fn(),
    downloadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('documents'),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    }),
  };

  const mockDocument: Partial<Document> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    documentTypeId: '456e7890-e89b-12d3-a456-426614174000',
    originalFilename: 'test.pdf',
    storedFilename: '1234567890-abcdef.pdf',
    fileKey: 'documents/1234567890-abcdef.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    s3Bucket: 'documents',
    extractedText: undefined,
    isProcessed: false,
    uploadedBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
        {
          provide: DocumentTypesService,
          useValue: mockDocumentTypesService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
    documentTypesService = module.get<DocumentTypesService>(DocumentTypesService);
    s3Service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUploadPresignedUrl', () => {
    it('should generate presigned upload URL', async () => {
      const input = {
        documentTypeId: '456e7890-e89b-12d3-a456-426614174000',
        filename: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024000,
      };
      const userId = 'user-123';

      mockDocumentTypesService.validateFile.mockResolvedValue(undefined);
      mockS3Service.generateFileKey.mockReturnValue('documents/1234567890-abcdef.pdf');
      mockS3Service.generateUploadPresignedUrl.mockResolvedValue({
        uploadUrl: 'https://minio.example.com/presigned-url',
        fileKey: 'documents/1234567890-abcdef.pdf',
        expiresIn: 900,
      });

      const result = await service.getUploadPresignedUrl(input, userId);

      expect(result).toEqual({
        uploadUrl: 'https://minio.example.com/presigned-url',
        fileKey: 'documents/1234567890-abcdef.pdf',
        expiresIn: 900,
      });
      expect(mockDocumentTypesService.validateFile).toHaveBeenCalledWith(
        input.documentTypeId,
        input.filename,
        input.fileSize,
      );
      expect(mockS3Service.generateFileKey).toHaveBeenCalledWith(input.filename, 'documents');
    });
  });

  describe('confirmDocumentUpload', () => {
    it('should confirm document upload and save metadata', async () => {
      const input = {
        documentTypeId: '456e7890-e89b-12d3-a456-426614174000',
        fileKey: 'documents/1234567890-abcdef.pdf',
        originalFilename: 'test.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
      };
      const userId = 'user-123';

      const queryRunner = mockDataSource.createQueryRunner();
      mockDocumentTypesService.validateFile.mockResolvedValue(undefined);
      mockRepository.create.mockReturnValue(mockDocument);
      queryRunner.manager.save.mockResolvedValue(mockDocument);
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.confirmDocumentUpload(input, userId);

      expect(result).toEqual(mockDocument);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return documents with filter', async () => {
      const filter = {
        documentTypeId: '456e7890-e89b-12d3-a456-426614174000',
        limit: 20,
        offset: 0,
      };

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockDocument]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(filter);

      expect(result).toEqual([mockDocument]);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'document.documentTypeId = :documentTypeId',
        { documentTypeId: filter.documentTypeId },
      );
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne(mockDocument.id!);

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
        relations: ['documentType'],
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate presigned download URL', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockS3Service.generateDownloadPresignedUrl.mockResolvedValue({
        downloadUrl: 'https://minio.example.com/download-url',
        expiresIn: 3600,
      });

      const result = await service.getDownloadUrl(mockDocument.id!);

      expect(result).toBe('https://minio.example.com/download-url');
      expect(mockS3Service.generateDownloadPresignedUrl).toHaveBeenCalledWith(
        mockDocument.fileKey,
        3600,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a document', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await service.remove(mockDocument.id!);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockDocument.id);
    });
  });

  describe('count', () => {
    it('should count documents', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.count();

      expect(result).toBe(5);
    });
  });
});
