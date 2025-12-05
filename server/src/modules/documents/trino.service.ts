/**
 * Trino Service
 * Gold Layer A - SQL Analytics Engine
 *
 * Provides integration with Trino for analytical queries on document chunks.
 * Trino is a distributed SQL query engine that allows federated queries
 * across multiple data sources.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface TrinoQueryResult {
  id: string;
  columns: Array<{ name: string; type: string }>;
  data: unknown[][];
  stats: {
    state: string;
    queued: boolean;
    scheduled: boolean;
    nodes: number;
    totalSplits: number;
    queuedSplits: number;
    runningSplits: number;
    completedSplits: number;
    cpuTimeMillis: number;
    wallTimeMillis: number;
    processedRows: number;
    processedBytes: number;
  };
}

export interface DocumentChunkRecord {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  has_table: boolean;
  has_image: boolean;
  extracted_entities: string; // JSON string
  category_name: string;
  document_filename: string;
  created_at: string;
}

@Injectable()
export class TrinoService implements OnModuleInit {
  private readonly logger = new Logger(TrinoService.name);
  private readonly client: AxiosInstance;
  private readonly enabled: boolean;
  private readonly host: string;
  private readonly port: number;
  private readonly catalog: string;
  private readonly schema: string;
  private readonly user: string;
  private initialized: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const enabledValue = this.configService.get<string>('TRINO_ENABLED', 'false');
    this.enabled = enabledValue === 'true' || enabledValue === '1';
    this.host = this.configService.get<string>('TRINO_HOST', 'localhost');
    this.port = this.configService.get<number>('TRINO_PORT', 8083);
    this.catalog = this.configService.get<string>('TRINO_CATALOG', 'memory');
    this.schema = this.configService.get<string>('TRINO_SCHEMA', 'default');
    this.user = this.configService.get<string>('TRINO_USER', 'intellicore');

    this.client = axios.create({
      baseURL: `http://${this.host}:${this.port}`,
      headers: {
        'X-Trino-User': this.user,
        'X-Trino-Catalog': this.catalog,
        'X-Trino-Schema': this.schema,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.logger.log('Trino is disabled, skipping initialization');
      return;
    }

    try {
      await this.checkConnection();
      await this.ensureSchemaExists();
      await this.ensureTableExists();
      this.initialized = true;
      this.logger.log('Trino service initialized successfully');
    } catch (error) {
      this.logger.warn(
        `Failed to initialize Trino: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          'Gold Layer A will be unavailable.',
      );
    }
  }

  /**
   * Check if Trino is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/info');
      this.logger.debug(`Trino version: ${response.data.nodeVersion?.version || 'unknown'}`);
      return true;
    } catch (error) {
      this.logger.warn('Trino is not available');
      return false;
    }
  }

  /**
   * Check if the service is ready to accept queries
   */
  isReady(): boolean {
    return this.enabled && this.initialized;
  }

  /**
   * Ensure the intellicore schema exists in Trino
   */
  private async ensureSchemaExists(): Promise<void> {
    const sql = `CREATE SCHEMA IF NOT EXISTS ${this.catalog}.intellicore`;
    await this.executeQuery(sql);
    this.logger.debug(`Schema ${this.catalog}.intellicore ensured`);
  }

  /**
   * Ensure the document_chunks table exists
   */
  private async ensureTableExists(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.catalog}.intellicore.document_chunks (
        chunk_id VARCHAR,
        document_id VARCHAR,
        chunk_index INTEGER,
        content VARCHAR,
        token_count INTEGER,
        has_table BOOLEAN,
        has_image BOOLEAN,
        extracted_entities VARCHAR,
        category_name VARCHAR,
        document_filename VARCHAR,
        created_at TIMESTAMP
      )
    `;
    await this.executeQuery(sql);
    this.logger.debug('Table document_chunks ensured');
  }

  /**
   * Execute a SQL query on Trino
   */
  async executeQuery(sql: string): Promise<TrinoQueryResult | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      // Submit query
      const submitResponse = await this.client.post('/v1/statement', sql, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      let result = submitResponse.data;
      const columns: Array<{ name: string; type: string }> = [];
      const data: unknown[][] = [];

      // Poll for results
      while (result.nextUri) {
        await this.sleep(100); // Wait before polling
        const nextResponse = await axios.get(result.nextUri, {
          headers: {
            'X-Trino-User': this.user,
          },
        });
        result = nextResponse.data;

        // Collect columns
        if (result.columns && columns.length === 0) {
          for (const col of result.columns) {
            columns.push({ name: col.name, type: col.type });
          }
        }

        // Collect data
        if (result.data) {
          data.push(...result.data);
        }
      }

      return {
        id: result.id,
        columns,
        data,
        stats: {
          state: result.stats?.state || 'FINISHED',
          queued: result.stats?.queued || false,
          scheduled: result.stats?.scheduled || false,
          nodes: result.stats?.nodes || 0,
          totalSplits: result.stats?.totalSplits || 0,
          queuedSplits: result.stats?.queuedSplits || 0,
          runningSplits: result.stats?.runningSplits || 0,
          completedSplits: result.stats?.completedSplits || 0,
          cpuTimeMillis: result.stats?.cpuTimeMillis || 0,
          wallTimeMillis: result.stats?.wallTimeMillis || 0,
          processedRows: result.stats?.processedRows || 0,
          processedBytes: result.stats?.processedBytes || 0,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        this.logger.error(`Trino query failed: ${errorMessage}`);
        throw new Error(`Trino query failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Insert a document chunk record into Trino
   */
  async insertChunk(record: DocumentChunkRecord): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Trino service is not ready');
    }

    const sql = `
      INSERT INTO ${this.catalog}.intellicore.document_chunks (
        chunk_id, document_id, chunk_index, content, token_count,
        has_table, has_image, extracted_entities, category_name,
        document_filename, created_at
      ) VALUES (
        '${this.escapeString(record.chunk_id)}',
        '${this.escapeString(record.document_id)}',
        ${record.chunk_index},
        '${this.escapeString(record.content)}',
        ${record.token_count},
        ${record.has_table},
        ${record.has_image},
        '${this.escapeString(record.extracted_entities)}',
        '${this.escapeString(record.category_name || '')}',
        '${this.escapeString(record.document_filename || '')}',
        TIMESTAMP '${record.created_at}'
      )
    `;

    await this.executeQuery(sql);
    this.logger.debug(`Inserted chunk ${record.chunk_id} into Trino`);
  }

  /**
   * Query document chunks by document ID
   */
  async getChunksByDocumentId(documentId: string): Promise<DocumentChunkRecord[]> {
    if (!this.isReady()) {
      return [];
    }

    const sql = `
      SELECT chunk_id, document_id, chunk_index, content, token_count,
             has_table, has_image, extracted_entities, category_name,
             document_filename, created_at
      FROM ${this.catalog}.intellicore.document_chunks
      WHERE document_id = '${this.escapeString(documentId)}'
      ORDER BY chunk_index
    `;

    const result = await this.executeQuery(sql);
    if (!result || result.data.length === 0) {
      return [];
    }

    return result.data.map((row) => ({
      chunk_id: row[0] as string,
      document_id: row[1] as string,
      chunk_index: row[2] as number,
      content: row[3] as string,
      token_count: row[4] as number,
      has_table: row[5] as boolean,
      has_image: row[6] as boolean,
      extracted_entities: row[7] as string,
      category_name: row[8] as string,
      document_filename: row[9] as string,
      created_at: row[10] as string,
    }));
  }

  /**
   * Get chunk count by category
   */
  async getChunkCountByCategory(): Promise<Array<{ category: string; count: number }>> {
    if (!this.isReady()) {
      return [];
    }

    const sql = `
      SELECT category_name, COUNT(*) as chunk_count
      FROM ${this.catalog}.intellicore.document_chunks
      GROUP BY category_name
      ORDER BY chunk_count DESC
    `;

    const result = await this.executeQuery(sql);
    if (!result || result.data.length === 0) {
      return [];
    }

    return result.data.map((row) => ({
      category: (row[0] as string) || 'Uncategorized',
      count: row[1] as number,
    }));
  }

  /**
   * Search chunks by content
   */
  async searchChunks(query: string, limit: number = 10): Promise<DocumentChunkRecord[]> {
    if (!this.isReady()) {
      return [];
    }

    const sql = `
      SELECT chunk_id, document_id, chunk_index, content, token_count,
             has_table, has_image, extracted_entities, category_name,
             document_filename, created_at
      FROM ${this.catalog}.intellicore.document_chunks
      WHERE LOWER(content) LIKE '%${this.escapeString(query.toLowerCase())}%'
      LIMIT ${limit}
    `;

    const result = await this.executeQuery(sql);
    if (!result || result.data.length === 0) {
      return [];
    }

    return result.data.map((row) => ({
      chunk_id: row[0] as string,
      document_id: row[1] as string,
      chunk_index: row[2] as number,
      content: row[3] as string,
      token_count: row[4] as number,
      has_table: row[5] as boolean,
      has_image: row[6] as boolean,
      extracted_entities: row[7] as string,
      category_name: row[8] as string,
      document_filename: row[9] as string,
      created_at: row[10] as string,
    }));
  }

  /**
   * Delete chunks by document ID
   */
  async deleteChunksByDocumentId(documentId: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    const sql = `
      DELETE FROM ${this.catalog}.intellicore.document_chunks
      WHERE document_id = '${this.escapeString(documentId)}'
    `;

    await this.executeQuery(sql);
    this.logger.debug(`Deleted chunks for document ${documentId} from Trino`);
  }

  /**
   * Get total chunk count
   */
  async getTotalChunkCount(): Promise<number> {
    if (!this.isReady()) {
      return 0;
    }

    const sql = `SELECT COUNT(*) FROM ${this.catalog}.intellicore.document_chunks`;
    const result = await this.executeQuery(sql);

    if (!result || result.data.length === 0) {
      return 0;
    }

    return result.data[0][0] as number;
  }

  /**
   * Escape SQL string to prevent injection
   */
  private escapeString(str: string): string {
    if (!str) return '';
    // Escape single quotes by doubling them
    return str.replace(/'/g, "''");
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
