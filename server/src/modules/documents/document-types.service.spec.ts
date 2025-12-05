import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentTypesService } from './document-types.service';
import { DocumentType } from './entities/document-type.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DocumentTypesService', () => {
  let service: DocumentTypesService;
  let repository: Repository<DocumentType>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDocumentType: DocumentType = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Type',
    description: 'Test description',
    allowedExtensions: ['.pdf', '.docx'],
    maxFileSizeMb: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  } as DocumentType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTypesService,
        {
          provide: getRepositoryToken(DocumentType),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentTypesService>(DocumentTypesService);
    repository = module.get<Repository<DocumentType>>(getRepositoryToken(DocumentType));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a document type', async () => {
      const input = {
        name: 'Test Type',
        description: 'Test description',
        allowedExtensions: ['.pdf', '.docx'],
        maxFileSizeMb: 50,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockDocumentType);
      mockRepository.save.mockResolvedValue(mockDocumentType);

      const result = await service.create(input);

      expect(result).toEqual(mockDocumentType);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { name: input.name } });
      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDocumentType);
    });

    it('should throw ConflictException if name already exists', async () => {
      const input = {
        name: 'Test Type',
        description: 'Test description',
        allowedExtensions: ['.pdf'],
        maxFileSizeMb: 50,
      };

      mockRepository.findOne.mockResolvedValue(mockDocumentType);

      await expect(service.create(input)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all document types', async () => {
      mockRepository.find.mockResolvedValue([mockDocumentType]);

      const result = await service.findAll();

      expect(result).toEqual([mockDocumentType]);
      expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findAllActive', () => {
    it('should return only active document types', async () => {
      mockRepository.find.mockResolvedValue([mockDocumentType]);

      const result = await service.findAllActive();

      expect(result).toEqual([mockDocumentType]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a document type by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocumentType);

      const result = await service.findOne(mockDocumentType.id);

      expect(result).toEqual(mockDocumentType);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockDocumentType.id } });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a document type', async () => {
      const input = {
        id: mockDocumentType.id,
        name: 'Updated Name',
        maxFileSizeMb: 100,
      };

      const updatedType = { ...mockDocumentType, ...input };

      mockRepository.findOne.mockResolvedValueOnce(mockDocumentType).mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(updatedType);

      const result = await service.update(input);

      expect(result.name).toBe('Updated Name');
      expect(result.maxFileSizeMb).toBe(100);
    });

    it('should throw NotFoundException if document type not found', async () => {
      const input = {
        id: 'non-existent',
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(input)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if name already exists', async () => {
      const input = {
        id: mockDocumentType.id,
        name: 'Existing Name',
      };

      const existingType = { ...mockDocumentType, id: 'different-id', name: 'Existing Name' };

      mockRepository.findOne
        .mockResolvedValueOnce(mockDocumentType)
        .mockResolvedValueOnce(existingType);

      await expect(service.update(input)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a document type', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocumentType);
      mockRepository.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      });
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(mockDocumentType.id);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockDocumentType.id);
    });

    it('should throw ConflictException if documents exist', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocumentType);
      mockRepository.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      });

      await expect(service.remove(mockDocumentType.id)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateFile', () => {
    it('should validate a valid file', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocumentType);

      await expect(
        service.validateFile(mockDocumentType.id, 'document.pdf', 10 * 1024 * 1024),
      ).resolves.not.toThrow();
    });

    it('should throw ConflictException for inactive document type', async () => {
      const inactiveType = { ...mockDocumentType, isActive: false };
      mockRepository.findOne.mockResolvedValue(inactiveType);

      await expect(
        service.validateFile(inactiveType.id, 'document.pdf', 10 * 1024 * 1024),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for invalid extension', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocumentType);

      await expect(
        service.validateFile(mockDocumentType.id, 'document.exe', 10 * 1024 * 1024),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for oversized file', async () => {
      mockRepository.findOne.mockResolvedValue(mockDocumentType);

      await expect(
        service.validateFile(mockDocumentType.id, 'document.pdf', 100 * 1024 * 1024),
      ).rejects.toThrow(ConflictException);
    });
  });
});
