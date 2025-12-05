/**
 * Query Optimizer Utilities
 * Sprint 15 - US-073: Performance Optimization
 *
 * Utilities for optimizing TypeORM queries.
 */

import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Apply efficient pagination to a query builder
 */
export function applyPagination<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationOptions,
): SelectQueryBuilder<T> {
  const { page = 1, limit = 20, maxLimit = 100 } = options;

  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  return queryBuilder.skip(offset).take(safeLimit);
}

/**
 * Execute paginated query with count
 */
export async function executePaginatedQuery<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 20, maxLimit = 100 } = options;

  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  // Use getManyAndCount for efficient pagination
  const [items, totalCount] = await queryBuilder
    .skip(offset)
    .take(safeLimit)
    .getManyAndCount();

  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    items,
    totalCount,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

/**
 * Apply select only needed fields (reduces memory usage)
 */
export function selectFields<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  fields: string[],
): SelectQueryBuilder<T> {
  const selections = fields.map((f) => `${alias}.${f}`);
  return queryBuilder.select(selections);
}

/**
 * Batch load related entities to avoid N+1 queries
 */
export function withBatchLoading<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  relations: string[],
): SelectQueryBuilder<T> {
  relations.forEach((relation) => {
    queryBuilder.leftJoinAndSelect(
      `${queryBuilder.alias}.${relation}`,
      relation,
    );
  });
  return queryBuilder;
}

/**
 * Apply optimistic locking check
 */
export function withVersionCheck<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  version: number,
): SelectQueryBuilder<T> {
  return queryBuilder.andWhere(`${queryBuilder.alias}.version = :version`, {
    version,
  });
}

/**
 * Create efficient index hints for PostgreSQL
 */
export function getIndexHint(indexName: string): string {
  // PostgreSQL doesn't support index hints directly, but we can use settings
  return `/*+ IndexScan(${indexName}) */`;
}

/**
 * Chunk array into batches for bulk operations
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Execute bulk insert with chunking
 */
export async function bulkInsert<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  entities: Partial<T>[],
  chunkSize = 500,
): Promise<number> {
  const chunks = chunkArray(entities, chunkSize);
  let inserted = 0;

  for (const chunk of chunks) {
    const result = await queryBuilder
      .insert()
      .values(chunk as any)
      .execute();
    inserted += result.identifiers.length;
  }

  return inserted;
}

/**
 * Build efficient WHERE IN clause for large arrays
 */
export function whereInChunked<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  column: string,
  values: (string | number)[],
  chunkSize = 1000,
): SelectQueryBuilder<T> {
  if (values.length <= chunkSize) {
    return queryBuilder.andWhere(`${column} IN (:...values)`, { values });
  }

  // For very large arrays, use a subquery approach
  const chunks = chunkArray(values, chunkSize);
  const paramSets: string[] = [];

  chunks.forEach((chunk, index) => {
    const paramName = `values_${index}`;
    queryBuilder.setParameter(paramName, chunk);
    paramSets.push(`${column} IN (:...${paramName})`);
  });

  return queryBuilder.andWhere(`(${paramSets.join(' OR ')})`);
}

/**
 * Apply cursor-based pagination (more efficient for large datasets)
 */
export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export function applyCursorPagination<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  cursorColumn: string,
  options: CursorPaginationOptions,
): SelectQueryBuilder<T> {
  const { cursor, limit = 20, direction = 'forward' } = options;

  if (cursor) {
    const operator = direction === 'forward' ? '>' : '<';
    queryBuilder.andWhere(`${cursorColumn} ${operator} :cursor`, {
      cursor: decodeCursor(cursor),
    });
  }

  const order = direction === 'forward' ? 'ASC' : 'DESC';
  queryBuilder.orderBy(cursorColumn, order).take(limit + 1);

  return queryBuilder;
}

export function encodeCursor(value: string | number | Date): string {
  const str = value instanceof Date ? value.toISOString() : String(value);
  return Buffer.from(str).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}
