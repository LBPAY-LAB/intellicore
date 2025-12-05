import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';

@Injectable()
export class DocumentTypesService {
  private readonly logger = new Logger(DocumentTypesService.name);

  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
  ) {}

  /**
   * Creates a new document type
   */
  async create(input: CreateDocumentTypeInput): Promise<DocumentType> {
    this.logger.log(`Creating document type: ${input.name}`);

    // Check if document type with same name already exists
    const existing = await this.documentTypeRepository.findOne({
      where: { name: input.name },
    });

    if (existing) {
      throw new ConflictException(`Document type with name '${input.name}' already exists`);
    }

    const documentType = this.documentTypeRepository.create(input);
    const saved = await this.documentTypeRepository.save(documentType);

    this.logger.log(`Document type created with id: ${saved.id}`);
    return saved;
  }

  /**
   * Finds all document types (including inactive)
   */
  async findAll(): Promise<DocumentType[]> {
    this.logger.log('Finding all document types');
    return this.documentTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Finds all active document types
   */
  async findAllActive(): Promise<DocumentType[]> {
    this.logger.log('Finding all active document types');
    return this.documentTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Finds a document type by ID
   */
  async findOne(id: string): Promise<DocumentType> {
    this.logger.log(`Finding document type with id: ${id}`);

    const documentType = await this.documentTypeRepository.findOne({
      where: { id },
    });

    if (!documentType) {
      throw new NotFoundException(`Document type with id '${id}' not found`);
    }

    return documentType;
  }

  /**
   * Finds a document type by name
   */
  async findByName(name: string): Promise<DocumentType | null> {
    this.logger.log(`Finding document type with name: ${name}`);
    return this.documentTypeRepository.findOne({
      where: { name },
    });
  }

  /**
   * Updates a document type
   */
  async update(input: UpdateDocumentTypeInput): Promise<DocumentType> {
    this.logger.log(`Updating document type with id: ${input.id}`);

    const documentType = await this.findOne(input.id);

    // If name is being updated, check for conflicts
    if (input.name && input.name !== documentType.name) {
      const existing = await this.findByName(input.name);
      if (existing) {
        throw new ConflictException(`Document type with name '${input.name}' already exists`);
      }
    }

    // Update fields
    if (input.name !== undefined) documentType.name = input.name;
    if (input.description !== undefined) documentType.description = input.description;
    if (input.allowedExtensions !== undefined) documentType.allowedExtensions = input.allowedExtensions;
    if (input.maxFileSizeMb !== undefined) documentType.maxFileSizeMb = input.maxFileSizeMb;
    if (input.isActive !== undefined) documentType.isActive = input.isActive;

    const updated = await this.documentTypeRepository.save(documentType);
    this.logger.log(`Document type updated: ${updated.id}`);

    return updated;
  }

  /**
   * Soft deletes a document type
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting document type with id: ${id}`);

    const documentType = await this.findOne(id);

    // Check if there are documents using this type
    const documentCount = await this.documentTypeRepository
      .createQueryBuilder('dt')
      .innerJoin('dt.documents', 'd')
      .where('dt.id = :id', { id })
      .andWhere('d.deleted_at IS NULL')
      .getCount();

    if (documentCount > 0) {
      throw new ConflictException(
        `Cannot delete document type '${documentType.name}' because it has ${documentCount} associated documents`,
      );
    }

    await this.documentTypeRepository.softDelete(id);
    this.logger.log(`Document type soft deleted: ${id}`);
  }

  /**
   * Validates if a file is allowed for this document type
   */
  async validateFile(documentTypeId: string, filename: string, fileSizeBytes: number): Promise<void> {
    const documentType = await this.findOne(documentTypeId);

    if (!documentType.isActive) {
      throw new ConflictException(`Document type '${documentType.name}' is not active`);
    }

    // Validate file extension
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const isExtensionAllowed = documentType.allowedExtensions.some(
      ext => ext.toLowerCase() === extension,
    );

    if (!isExtensionAllowed) {
      throw new ConflictException(
        `File extension '${extension}' is not allowed for document type '${documentType.name}'. ` +
        `Allowed extensions: ${documentType.allowedExtensions.join(', ')}`,
      );
    }

    // Validate file size
    const maxSizeBytes = documentType.maxFileSizeMb * 1024 * 1024;
    if (fileSizeBytes > maxSizeBytes) {
      throw new ConflictException(
        `File size ${(fileSizeBytes / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ` +
        `${documentType.maxFileSizeMb}MB for document type '${documentType.name}'`,
      );
    }
  }
}
