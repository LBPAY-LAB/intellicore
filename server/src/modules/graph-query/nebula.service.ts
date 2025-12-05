import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NebulaConfig } from './nebula.config';
import {
  NGQLResult,
  GraphVertex,
  GraphEdge,
  GraphSchema,
  GraphSchemaTag,
  GraphSchemaEdge,
  GraphStats,
} from './dto/graph-query.dto';
import * as net from 'net';

interface NebulaConnection {
  socket: net.Socket;
  sessionId: bigint | null;
  inUse: boolean;
  lastUsed: Date;
}

@Injectable()
export class NebulaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NebulaService.name);
  private config: NebulaConfig;
  private connectionPool: NebulaConnection[] = [];
  private initialized = false;
  private spaceCreated = false;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>('NEBULA_HOST', 'localhost'),
      port: this.configService.get<number>('NEBULA_PORT', 9669),
      username: this.configService.get<string>('NEBULA_USERNAME', 'root'),
      password: this.configService.get<string>('NEBULA_PASSWORD', 'nebula'),
      space: this.configService.get<string>('NEBULA_SPACE', 'intellicore'),
      maxConnectionPoolSize: this.configService.get<number>('NEBULA_MAX_POOL_SIZE', 10),
      minConnectionPoolSize: this.configService.get<number>('NEBULA_MIN_POOL_SIZE', 2),
      idleTimeout: this.configService.get<number>('NEBULA_IDLE_TIMEOUT', 60000),
    };
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.initialize();
    } catch (error) {
      this.logger.warn(
        `NebulaGraph initialization deferred - service not available: ${error.message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeAllConnections();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    const isAvailable = await this.checkConnection();
    if (!isAvailable) {
      this.logger.warn('NebulaGraph is not available, will retry on first query');
      return;
    }

    await this.ensureSpaceExists();
    this.initialized = true;
    this.logger.log('NebulaGraph service initialized successfully');
  }

  private async checkConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 3000);

      socket.connect(this.config.port, this.config.host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  private async ensureSpaceExists(): Promise<void> {
    if (this.spaceCreated) return;

    const createSpaceQuery = `
      CREATE SPACE IF NOT EXISTS ${this.config.space} (
        vid_type = FIXED_STRING(64),
        partition_num = 10,
        replica_factor = 1
      );
    `;

    try {
      await this.executeRawNGQL(createSpaceQuery);

      // Wait for space to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Use the space
      await this.executeRawNGQL(`USE ${this.config.space};`);

      // Create schema for intelliCore entities
      await this.createIntelliCoreSchema();

      this.spaceCreated = true;
      this.logger.log(`NebulaGraph space '${this.config.space}' is ready`);
    } catch (error) {
      this.logger.error(`Failed to create space: ${error.message}`);
      throw error;
    }
  }

  private async createIntelliCoreSchema(): Promise<void> {
    // Create tags (vertex types) for intelliCore entities
    const tagQueries = [
      `CREATE TAG IF NOT EXISTS Instance (
        object_type_id string,
        object_type_name string,
        display_name string,
        status string,
        created_at datetime,
        updated_at datetime,
        data string
      );`,
      `CREATE TAG IF NOT EXISTS ObjectType (
        name string,
        display_name string,
        description string,
        category string,
        created_at datetime
      );`,
      // CoreBanking Brain - Document Chunk tag (Sprint 17)
      `CREATE TAG IF NOT EXISTS DocumentChunk (
        document_id string,
        chunk_index int,
        content string,
        token_count int,
        page_number int,
        has_table bool,
        has_image bool,
        section_path string,
        created_at datetime
      );`,
      // CoreBanking Brain - Extracted Entity tag (Sprint 17)
      `CREATE TAG IF NOT EXISTS Entity (
        entity_type string,
        value string,
        normalized_value string,
        confidence double,
        source_document_id string,
        source_chunk_id string,
        created_at datetime
      );`,
      // CoreBanking Brain - Document tag (Sprint 17)
      `CREATE TAG IF NOT EXISTS Document (
        filename string,
        category_id string,
        category_name string,
        file_type string,
        status string,
        bronze_processed_at datetime,
        silver_processed_at datetime,
        created_at datetime
      );`,
    ];

    // Create edge types
    const edgeQueries = [
      `CREATE EDGE IF NOT EXISTS RELATES_TO (
        relationship_type string,
        created_at datetime,
        metadata string
      );`,
      `CREATE EDGE IF NOT EXISTS BELONGS_TO (
        role string,
        created_at datetime
      );`,
      `CREATE EDGE IF NOT EXISTS INSTANCE_OF (
        created_at datetime
      );`,
      // CoreBanking Brain edge types (Sprint 17)
      `CREATE EDGE IF NOT EXISTS CONTAINS_CHUNK (
        chunk_index int,
        created_at datetime
      );`,
      `CREATE EDGE IF NOT EXISTS MENTIONS (
        start_offset int,
        end_offset int,
        confidence double,
        created_at datetime
      );`,
      `CREATE EDGE IF NOT EXISTS EXTRACTED_FROM (
        extraction_method string,
        created_at datetime
      );`,
      `CREATE EDGE IF NOT EXISTS REFERENCES_ENTITY (
        context string,
        created_at datetime
      );`,
      `CREATE EDGE IF NOT EXISTS SAME_AS (
        confidence double,
        created_at datetime
      );`,
    ];

    for (const query of [...tagQueries, ...edgeQueries]) {
      try {
        await this.executeRawNGQL(query);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message?.includes('already exists')) {
          this.logger.warn(`Schema creation warning: ${error.message}`);
        }
      }
    }
  }

  private async executeRawNGQL(query: string): Promise<unknown> {
    // For now, we'll use a simple TCP connection approach
    // In production, you'd use the official nebula3-ts or nebula-node client
    this.logger.debug(`Executing nGQL: ${query.substring(0, 100)}...`);

    // Placeholder for actual execution
    // The real implementation would use nebula3-ts client
    return { success: true };
  }

  async execute(
    query: string,
    parameters?: Record<string, unknown>,
  ): Promise<NGQLResult> {
    const startTime = Date.now();

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Parameter substitution (basic implementation)
      let finalQuery = query;
      if (parameters) {
        for (const [key, value] of Object.entries(parameters)) {
          const placeholder = `$${key}`;
          const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
          finalQuery = finalQuery.replace(new RegExp(`\\$${key}`, 'g'), valueStr);
        }
      }

      const result = await this.executeRawNGQL(finalQuery);
      const executionTimeMs = Date.now() - startTime;

      return {
        success: true,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      this.logger.error(`nGQL execution failed: ${error.message}`);

      return {
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
        errorMessage: error.message,
      };
    }
  }

  async getSchema(): Promise<GraphSchema> {
    const tags: GraphSchemaTag[] = [];
    const edges: GraphSchemaEdge[] = [];

    try {
      // Get tags
      const tagResult = await this.execute('SHOW TAGS;');
      if (tagResult.success && tagResult.rows) {
        for (const row of tagResult.rows) {
          const tagName = row[0] as string;
          const descResult = await this.execute(`DESCRIBE TAG ${tagName};`);
          const properties = descResult.rows?.map(r => r[0] as string) || [];
          tags.push({ name: tagName, properties });
        }
      }

      // Get edges
      const edgeResult = await this.execute('SHOW EDGES;');
      if (edgeResult.success && edgeResult.rows) {
        for (const row of edgeResult.rows) {
          const edgeName = row[0] as string;
          const descResult = await this.execute(`DESCRIBE EDGE ${edgeName};`);
          const properties = descResult.rows?.map(r => r[0] as string) || [];
          edges.push({ name: edgeName, properties });
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to get schema: ${error.message}`);
    }

    return {
      tags,
      edges,
      space: this.config.space,
    };
  }

  async getStats(): Promise<GraphStats> {
    const stats: GraphStats = {
      totalVertices: 0,
      totalEdges: 0,
      verticesByTag: {},
      edgesByType: {},
    };

    try {
      // This would require actual nGQL queries to count vertices and edges
      // Placeholder implementation
      const schema = await this.getSchema();

      for (const tag of schema.tags) {
        const result = await this.execute(
          `MATCH (v:${tag.name}) RETURN count(v) as count;`,
        );
        if (result.success && result.rows?.length > 0) {
          const count = Number(result.rows[0][0]) || 0;
          stats.verticesByTag[tag.name] = count;
          stats.totalVertices += count;
        }
      }

      for (const edge of schema.edges) {
        const result = await this.execute(
          `MATCH ()-[e:${edge.name}]->() RETURN count(e) as count;`,
        );
        if (result.success && result.rows?.length > 0) {
          const count = Number(result.rows[0][0]) || 0;
          stats.edgesByType[edge.name] = count;
          stats.totalEdges += count;
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to get stats: ${error.message}`);
    }

    return stats;
  }

  async insertVertex(
    vertexId: string,
    tag: string,
    properties: Record<string, unknown>,
  ): Promise<boolean> {
    const propValues = Object.entries(properties)
      .map(([_, value]) => {
        if (typeof value === 'string') return `"${value}"`;
        if (value instanceof Date) return `datetime("${value.toISOString()}")`;
        return String(value);
      })
      .join(', ');

    const propNames = Object.keys(properties).join(', ');

    const query = `INSERT VERTEX ${tag} (${propNames}) VALUES "${vertexId}":(${propValues});`;
    const result = await this.execute(query);
    return result.success;
  }

  async insertEdge(
    sourceId: string,
    targetId: string,
    edgeType: string,
    properties: Record<string, unknown> = {},
    rank = 0,
  ): Promise<boolean> {
    let propClause = '';
    if (Object.keys(properties).length > 0) {
      const propValues = Object.entries(properties)
        .map(([_, value]) => {
          if (typeof value === 'string') return `"${value}"`;
          if (value instanceof Date) return `datetime("${value.toISOString()}")`;
          return String(value);
        })
        .join(', ');
      const propNames = Object.keys(properties).join(', ');
      propClause = `(${propNames})`;
    }

    const query = `INSERT EDGE ${edgeType} ${propClause} VALUES "${sourceId}"->"${targetId}"@${rank}:(${Object.keys(properties).length > 0 ? Object.values(properties).map(v => typeof v === 'string' ? `"${v}"` : v).join(', ') : ''});`;
    const result = await this.execute(query);
    return result.success;
  }

  async deleteVertex(vertexId: string): Promise<boolean> {
    const query = `DELETE VERTEX "${vertexId}" WITH EDGE;`;
    const result = await this.execute(query);
    return result.success;
  }

  async deleteEdge(
    sourceId: string,
    targetId: string,
    edgeType: string,
    rank = 0,
  ): Promise<boolean> {
    const query = `DELETE EDGE ${edgeType} "${sourceId}"->"${targetId}"@${rank};`;
    const result = await this.execute(query);
    return result.success;
  }

  async upsertVertex(
    vertexId: string,
    tag: string,
    properties: Record<string, unknown>,
  ): Promise<boolean> {
    const setClause = Object.entries(properties)
      .map(([key, value]) => {
        if (typeof value === 'string') return `${key} = "${value}"`;
        if (value instanceof Date) return `${key} = datetime("${value.toISOString()}")`;
        return `${key} = ${value}`;
      })
      .join(', ');

    const query = `UPSERT VERTEX ON ${tag} "${vertexId}" SET ${setClause};`;
    const result = await this.execute(query);
    return result.success;
  }

  parseVertexFromResult(row: unknown[], columns: string[]): GraphVertex | null {
    // Placeholder - actual implementation depends on nGQL result format
    return null;
  }

  parseEdgeFromResult(row: unknown[], columns: string[]): GraphEdge | null {
    // Placeholder - actual implementation depends on nGQL result format
    return null;
  }

  private async closeAllConnections(): Promise<void> {
    for (const conn of this.connectionPool) {
      try {
        conn.socket?.destroy();
      } catch (error) {
        this.logger.warn(`Error closing connection: ${error.message}`);
      }
    }
    this.connectionPool = [];
    this.initialized = false;
    this.logger.log('All NebulaGraph connections closed');
  }

  isHealthy(): boolean {
    return this.initialized;
  }
}
