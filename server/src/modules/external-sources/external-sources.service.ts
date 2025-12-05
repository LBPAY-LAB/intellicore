/**
 * ExternalSourcesService
 * Sprint 18 - US-DB-013/014: External Data Source Management
 *
 * Service for managing external data source configurations and connections.
 */

import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ExternalSource,
  ExternalSourceType,
  ExternalSourceStatus,
} from './entities/external-source.entity';
import {
  CreateExternalSourceInput,
  UpdateExternalSourceInput,
} from './dto/external-source.input';
import { Document } from '../documents/entities/document.entity';
import { DocumentType } from '../documents/entities/document-type.entity';
import { EmbeddingsService } from '../rag/embeddings.service';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface CrawlResult {
  source_url: string;
  pages_crawled: number;
  pages_failed: number;
  total_content_length: number;
  duration_seconds: number;
  pages: Array<{
    url: string;
    title: string;
    content: string;
    content_length: number;
    depth: number;
  }>;
  errors: string[];
}

@Injectable()
export class ExternalSourcesService {
  private readonly logger = new Logger(ExternalSourcesService.name);
  private readonly llmGatewayUrl: string;

  constructor(
    @InjectRepository(ExternalSource)
    private readonly externalSourceRepository: Repository<ExternalSource>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => EmbeddingsService))
    private readonly embeddingsService: EmbeddingsService,
  ) {
    this.llmGatewayUrl = this.configService.get<string>('LLM_GATEWAY_URL', 'http://localhost:8001');
  }

  async findAll(): Promise<ExternalSource[]> {
    return this.externalSourceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<ExternalSource[]> {
    return this.externalSourceRepository.find({
      where: { isEnabled: true, status: ExternalSourceStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ExternalSource> {
    const source = await this.externalSourceRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException(`External source with ID ${id} not found`);
    }
    return source;
  }

  async findByType(type: ExternalSourceType): Promise<ExternalSource[]> {
    return this.externalSourceRepository.find({
      where: { sourceType: type, isEnabled: true },
    });
  }

  async create(input: CreateExternalSourceInput): Promise<ExternalSource> {
    // Validate connection config based on source type
    this.validateConnectionConfig(input.sourceType, input.connectionConfig);

    const source = this.externalSourceRepository.create({
      ...input,
      status: ExternalSourceStatus.INACTIVE,
    });

    const savedSource = await this.externalSourceRepository.save(source);
    this.logger.log(`Created external source: ${savedSource.name} (${savedSource.id})`);

    return savedSource;
  }

  async update(input: UpdateExternalSourceInput): Promise<ExternalSource> {
    const source = await this.findOne(input.id);

    if (input.connectionConfig) {
      this.validateConnectionConfig(
        input.sourceType || source.sourceType,
        input.connectionConfig,
      );
    }

    Object.assign(source, input);
    const updatedSource = await this.externalSourceRepository.save(source);
    this.logger.log(`Updated external source: ${updatedSource.name} (${updatedSource.id})`);

    return updatedSource;
  }

  async delete(id: string): Promise<boolean> {
    const source = await this.findOne(id);
    await this.externalSourceRepository.softDelete(id);
    this.logger.log(`Deleted external source: ${source.name} (${id})`);
    return true;
  }

  async toggleEnabled(id: string): Promise<ExternalSource> {
    const source = await this.findOne(id);
    source.isEnabled = !source.isEnabled;

    if (!source.isEnabled) {
      source.status = ExternalSourceStatus.INACTIVE;
    }

    return this.externalSourceRepository.save(source);
  }

  async testConnection(id: string): Promise<ConnectionTestResult> {
    const source = await this.findOne(id);
    const startTime = Date.now();

    let result: ConnectionTestResult;

    try {
      switch (source.sourceType) {
        case ExternalSourceType.TIGERBEETLE:
          result = await this.testTigerBeetleConnection(source);
          break;
        case ExternalSourceType.POSTGRES:
          result = await this.testPostgresConnection(source);
          break;
        case ExternalSourceType.MYSQL:
          result = await this.testMysqlConnection(source);
          break;
        case ExternalSourceType.REST_API:
          result = await this.testRestApiConnection(source);
          break;
        case ExternalSourceType.GRAPHQL_API:
          result = await this.testGraphqlApiConnection(source);
          break;
        case ExternalSourceType.WEB_CRAWLER:
          result = await this.testWebCrawlerConnection(source);
          break;
        default:
          result = { success: false, message: `Unsupported source type: ${source.sourceType}` };
      }

      result.latencyMs = Date.now() - startTime;

      // Update source with test results
      source.lastTestedAt = new Date();
      source.lastTestSuccess = result.success;
      source.lastTestMessage = result.message;

      if (result.success) {
        source.status = ExternalSourceStatus.ACTIVE;
      } else {
        source.status = ExternalSourceStatus.ERROR;
      }

      await this.externalSourceRepository.save(source);

      this.logger.log(
        `Connection test for ${source.name}: ${result.success ? 'SUCCESS' : 'FAILED'} (${result.latencyMs}ms)`,
      );

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      source.lastTestedAt = new Date();
      source.lastTestSuccess = false;
      source.lastTestMessage = errorMessage;
      source.status = ExternalSourceStatus.ERROR;
      await this.externalSourceRepository.save(source);

      this.logger.error(`Connection test failed for ${source.name}: ${errorMessage}`);

      return {
        success: false,
        message: errorMessage,
        latencyMs,
      };
    }
  }

  private async testTigerBeetleConnection(source: ExternalSource): Promise<ConnectionTestResult> {
    const config = source.connectionConfig;

    if (!config.clusterAddress) {
      return { success: false, message: 'TigerBeetle cluster address is required' };
    }

    // TigerBeetle uses a custom binary protocol
    // For now, we'll do a basic TCP connectivity check
    const net = await import('net');

    return new Promise((resolve) => {
      const [host, portStr] = config.clusterAddress.split(':');
      const port = parseInt(portStr, 10) || 3000;

      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ success: false, message: 'Connection timeout' });
      }, 5000);

      socket.connect(port, host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve({
          success: true,
          message: 'TigerBeetle cluster is reachable',
          details: { host, port },
        });
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        resolve({ success: false, message: `Connection failed: ${err.message}` });
      });
    });
  }

  private async testPostgresConnection(source: ExternalSource): Promise<ConnectionTestResult> {
    const config = source.connectionConfig;

    const pool = new Pool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });

    try {
      const client = await pool.connect();
      const result = await client.query('SELECT version()');
      const version = result.rows[0]?.version;
      client.release();
      await pool.end();

      return {
        success: true,
        message: 'Connected to PostgreSQL successfully',
        details: { version, database: config.database },
      };
    } catch (error) {
      await pool.end().catch(() => {});
      throw error;
    }
  }

  private async testMysqlConnection(source: ExternalSource): Promise<ConnectionTestResult> {
    // MySQL connection test would use mysql2 package
    // For now, return a placeholder
    return {
      success: false,
      message: 'MySQL connector not yet implemented',
    };
  }

  private async testRestApiConnection(source: ExternalSource): Promise<ConnectionTestResult> {
    const config = source.connectionConfig;

    if (!config.baseUrl) {
      return { success: false, message: 'REST API base URL is required' };
    }

    const headers: Record<string, string> = {
      ...config.headers,
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await axios.get(config.baseUrl, {
      headers,
      timeout: config.timeout || 10000,
      validateStatus: () => true, // Accept any status
    });

    if (response.status >= 200 && response.status < 400) {
      return {
        success: true,
        message: `REST API responded with status ${response.status}`,
        details: { status: response.status, headers: response.headers },
      };
    }

    return {
      success: false,
      message: `REST API returned error status ${response.status}`,
      details: { status: response.status },
    };
  }

  private async testGraphqlApiConnection(source: ExternalSource): Promise<ConnectionTestResult> {
    const config = source.connectionConfig;

    if (!config.baseUrl) {
      return { success: false, message: 'GraphQL API URL is required' };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await axios.post(
      config.baseUrl,
      { query: '{ __typename }' },
      {
        headers,
        timeout: config.timeout || 10000,
        validateStatus: () => true,
      },
    );

    if (response.status === 200 && response.data?.data) {
      return {
        success: true,
        message: 'GraphQL API is accessible',
        details: { status: response.status },
      };
    }

    return {
      success: false,
      message: `GraphQL API returned: ${JSON.stringify(response.data?.errors || response.status)}`,
      details: { status: response.status, errors: response.data?.errors },
    };
  }

  private async testWebCrawlerConnection(source: ExternalSource): Promise<ConnectionTestResult> {
    const config = source.connectionConfig;

    if (!config.startUrl) {
      return { success: false, message: 'Start URL is required' };
    }

    try {
      // Validate URL by making a HEAD request
      const response = await axios.head(config.startUrl, {
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'intelliCore-WebCrawler/1.0 (CoreBanking Brain)',
        },
      });

      if (response.status >= 200 && response.status < 400) {
        // Also check if LLM Gateway crawler service is available
        try {
          await axios.get(`${this.llmGatewayUrl}/health`, { timeout: 5000 });
          return {
            success: true,
            message: `URL is accessible (status ${response.status}) and crawler service is ready`,
            details: {
              status: response.status,
              contentType: response.headers['content-type'],
              startUrl: config.startUrl,
            },
          };
        } catch {
          return {
            success: true,
            message: `URL is accessible but crawler service may not be running (will work when LLM Gateway starts)`,
            details: { status: response.status, startUrl: config.startUrl },
          };
        }
      }

      return {
        success: false,
        message: `URL returned error status ${response.status}`,
        details: { status: response.status },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to reach URL: ${errorMessage}`,
      };
    }
  }

  private validateConnectionConfig(type: ExternalSourceType, config: Record<string, any>): void {
    switch (type) {
      case ExternalSourceType.TIGERBEETLE:
        if (!config.clusterAddress) {
          throw new BadRequestException('TigerBeetle config requires clusterAddress');
        }
        break;

      case ExternalSourceType.POSTGRES:
        if (!config.host || !config.database || !config.username) {
          throw new BadRequestException(
            'PostgreSQL config requires host, database, and username',
          );
        }
        break;

      case ExternalSourceType.REST_API:
      case ExternalSourceType.GRAPHQL_API:
        if (!config.baseUrl) {
          throw new BadRequestException('API config requires baseUrl');
        }
        break;

      case ExternalSourceType.WEB_CRAWLER:
        if (!config.startUrl) {
          throw new BadRequestException('Web Crawler config requires startUrl');
        }
        break;

      default:
        break;
    }
  }

  // Method for sync operations
  async syncData(id: string, fullSync = false): Promise<{ success: boolean; recordsProcessed: number }> {
    const source = await this.findOne(id);

    if (!source.isEnabled) {
      throw new BadRequestException('Cannot sync disabled source');
    }

    if (source.status !== ExternalSourceStatus.ACTIVE) {
      throw new BadRequestException('Source must be tested and active before syncing');
    }

    let recordsProcessed = 0;

    try {
      this.logger.log(
        `Starting ${fullSync ? 'full' : 'incremental'} sync for ${source.name}`,
      );

      // Dispatch to type-specific sync handlers
      switch (source.sourceType) {
        case ExternalSourceType.WEB_CRAWLER:
          recordsProcessed = await this.syncWebCrawler(source);
          break;
        default:
          this.logger.log(`Sync not implemented for source type: ${source.sourceType}`);
          break;
      }

      // Update sync stats
      source.lastSyncAt = new Date();
      source.syncSuccessCount += 1;
      source.lastSyncError = '';
      await this.externalSourceRepository.save(source);

      return { success: true, recordsProcessed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      source.lastSyncAt = new Date();
      source.syncFailureCount += 1;
      source.lastSyncError = errorMessage;
      await this.externalSourceRepository.save(source);

      this.logger.error(`Sync failed for ${source.name}: ${errorMessage}`);

      return { success: false, recordsProcessed };
    }
  }

  /**
   * Sync web crawler source - crawl website and create documents
   */
  private async syncWebCrawler(source: ExternalSource): Promise<number> {
    const config = source.connectionConfig;

    this.logger.log(`Starting web crawl for: ${config.startUrl}`);

    // Call the Python crawler service
    const crawlRequest = {
      start_url: config.startUrl,
      url_pattern: config.urlPattern || null,
      max_depth: config.maxDepth ?? 3,
      max_pages: config.maxPages ?? 50,
      content_selectors: config.contentSelectors || null,
      respect_robots_txt: config.respectRobotsTxt ?? true,
      follow_subdomains: config.followSubdomains ?? false,
    };

    const response = await axios.post<CrawlResult>(
      `${this.llmGatewayUrl}/api/v1/crawler/crawl`,
      crawlRequest,
      { timeout: 300000 }, // 5 minutes timeout for crawling
    );

    const crawlResult = response.data;

    this.logger.log(
      `Crawl completed: ${crawlResult.pages_crawled} pages, ${crawlResult.pages_failed} failed`,
    );

    if (crawlResult.pages.length === 0) {
      this.logger.warn('No pages were crawled');
      return 0;
    }

    // Find or create a document type for crawled content
    let documentType = await this.documentTypeRepository.findOne({
      where: { name: 'Web Content' },
    });

    if (!documentType) {
      documentType = this.documentTypeRepository.create({
        name: 'Web Content',
        description: 'Content crawled from web sources',
        allowedExtensions: ['html', 'htm'],
        maxFileSizeMb: 10, // 10 MB
        isActive: true,
      });
      documentType = await this.documentTypeRepository.save(documentType);
      this.logger.log('Created "Web Content" document type');
    }

    // Create documents from crawled pages
    let documentsCreated = 0;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const page of crawlResult.pages) {
        // Check if document already exists for this URL
        const existingDoc = await queryRunner.manager.findOne(Document, {
          where: { originalFilename: page.url },
        });

        if (existingDoc) {
          // Update existing document
          existingDoc.extractedText = page.content;
          existingDoc.isProcessed = true;
          existingDoc.bronzeProcessedAt = new Date();
          existingDoc.bronzeMetadata = {
            title: page.title,
            source: 'web_crawler',
            sourceId: source.id,
            sourceName: source.name,
            crawledAt: new Date().toISOString(),
            depth: page.depth,
            wordCount: page.content.split(/\s+/).length,
            charCount: page.content.length,
          } as any;
          await queryRunner.manager.save(existingDoc);
          this.logger.debug(`Updated existing document for URL: ${page.url}`);
        } else {
          // Create new document
          const document = queryRunner.manager.create(Document, {
            documentTypeId: documentType.id,
            originalFilename: page.url,
            storedFilename: `crawled_${Date.now()}_${documentsCreated}.html`,
            fileKey: `crawled/${source.id}/${Date.now()}_${documentsCreated}.html`,
            fileSize: page.content_length,
            mimeType: 'text/html',
            s3Bucket: 'documents',
            uploadedBy: 'system',
            isProcessed: true,
            extractedText: page.content,
            bronzeProcessedAt: new Date(),
            bronzeMetadata: {
              title: page.title,
              source: 'web_crawler',
              sourceId: source.id,
              sourceName: source.name,
              crawledAt: new Date().toISOString(),
              depth: page.depth,
              wordCount: page.content.split(/\s+/).length,
              charCount: page.content.length,
            } as any,
          });

          const savedDoc = await queryRunner.manager.save(document);
          documentsCreated++;

          // Enqueue for embedding generation (asynchronously)
          this.embeddingsService.enqueueDocumentEmbedding(savedDoc.id).catch((error) => {
            this.logger.error(`Failed to enqueue document ${savedDoc.id} for embedding:`, error);
          });
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Created ${documentsCreated} documents from crawled content`);

      return documentsCreated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
