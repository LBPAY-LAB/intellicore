import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentCategory } from './entities/document-category.entity';
import { CreateDocumentCategoryInput } from './dto/create-document-category.input';
import { UpdateDocumentCategoryInput } from './dto/update-document-category.input';

@Injectable()
export class DocumentCategoriesService {
  private readonly logger = new Logger(DocumentCategoriesService.name);

  constructor(
    @InjectRepository(DocumentCategory)
    private readonly documentCategoryRepository: Repository<DocumentCategory>,
  ) {}

  /**
   * Creates a new document category
   */
  async create(input: CreateDocumentCategoryInput): Promise<DocumentCategory> {
    this.logger.log(`Creating document category: ${input.name}`);

    // Check if document category with same name already exists
    const existing = await this.documentCategoryRepository.findOne({
      where: { name: input.name },
    });

    if (existing) {
      throw new ConflictException(`Document category with name '${input.name}' already exists`);
    }

    // Use default RAG config if not provided
    const defaultRagConfig = {
      chunkingStrategy: 'semantic' as const,
      chunkSize: 1000,
      chunkOverlap: 200,
      embeddingModel: 'text-embedding-3-small',
    };

    const documentCategory = this.documentCategoryRepository.create({
      ...input,
      ragConfig: input.ragConfig || defaultRagConfig,
    });

    const saved = await this.documentCategoryRepository.save(documentCategory);

    this.logger.log(`Document category created with id: ${saved.id}`);
    return saved;
  }

  /**
   * Finds all document categories (including inactive)
   */
  async findAll(): Promise<DocumentCategory[]> {
    this.logger.log('Finding all document categories');
    return this.documentCategoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Finds all active document categories
   */
  async findAllActive(): Promise<DocumentCategory[]> {
    this.logger.log('Finding all active document categories');
    return this.documentCategoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Finds document categories by Gold layer
   */
  async findByGoldLayer(goldLayer: 'A' | 'B' | 'C'): Promise<DocumentCategory[]> {
    this.logger.log(`Finding document categories for Gold layer: ${goldLayer}`);

    const categories = await this.documentCategoryRepository
      .createQueryBuilder('dc')
      .where('dc.is_active = :isActive', { isActive: true })
      .andWhere(`dc.target_gold_layers LIKE :goldLayer`, { goldLayer: `%${goldLayer}%` })
      .orderBy('dc.name', 'ASC')
      .getMany();

    return categories;
  }

  /**
   * Finds a document category by ID
   */
  async findOne(id: string): Promise<DocumentCategory> {
    this.logger.log(`Finding document category with id: ${id}`);

    const documentCategory = await this.documentCategoryRepository.findOne({
      where: { id },
    });

    if (!documentCategory) {
      throw new NotFoundException(`Document category with id '${id}' not found`);
    }

    return documentCategory;
  }

  /**
   * Finds a document category by name
   */
  async findByName(name: string): Promise<DocumentCategory | null> {
    this.logger.log(`Finding document category with name: ${name}`);
    return this.documentCategoryRepository.findOne({
      where: { name },
    });
  }

  /**
   * Updates a document category
   */
  async update(input: UpdateDocumentCategoryInput): Promise<DocumentCategory> {
    this.logger.log(`Updating document category with id: ${input.id}`);

    const documentCategory = await this.findOne(input.id);

    // If name is being updated, check for conflicts
    if (input.name && input.name !== documentCategory.name) {
      const existing = await this.findByName(input.name);
      if (existing) {
        throw new ConflictException(`Document category with name '${input.name}' already exists`);
      }
    }

    // Update fields
    if (input.name !== undefined) documentCategory.name = input.name;
    if (input.description !== undefined) documentCategory.description = input.description;
    if (input.ragConfig !== undefined) documentCategory.ragConfig = input.ragConfig;
    if (input.metadataSchema !== undefined) documentCategory.metadataSchema = input.metadataSchema;
    if (input.targetGoldLayers !== undefined) documentCategory.targetGoldLayers = input.targetGoldLayers;
    if (input.isActive !== undefined) documentCategory.isActive = input.isActive;

    const updated = await this.documentCategoryRepository.save(documentCategory);
    this.logger.log(`Document category updated: ${updated.id}`);

    return updated;
  }

  /**
   * Soft deletes a document category
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Soft deleting document category with id: ${id}`);

    const documentCategory = await this.findOne(id);

    await this.documentCategoryRepository.softDelete(id);
    this.logger.log(`Document category soft deleted: ${id}`);
  }

  /**
   * Validates if a category is active
   */
  async validateCategory(categoryId: string): Promise<void> {
    const category = await this.findOne(categoryId);

    if (!category.isActive) {
      throw new ConflictException(`Document category '${category.name}' is not active`);
    }
  }

  /**
   * Gets RAG configuration for a specific category
   */
  async getRagConfig(categoryId: string) {
    const category = await this.findOne(categoryId);
    return category.ragConfig;
  }

  /**
   * Gets metadata schema for a specific category
   */
  async getMetadataSchema(categoryId: string) {
    const category = await this.findOne(categoryId);
    return category.metadataSchema;
  }
}
