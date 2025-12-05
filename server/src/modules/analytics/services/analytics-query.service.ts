/**
 * Analytics Query Service
 * Sprint 14 - US-067: Analytics Dashboard
 *
 * Service for executing analytics queries with aggregations,
 * filtering, and time series analysis.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { InstanceEntity, InstanceStatus } from '../../instances/entities/instance.entity';
import { InstanceRelationshipEntity } from '../../instances/entities/instance-relationship.entity';
import { ObjectTypeEntity } from '../../object-types/entities/object-type.entity';
import { Document as DocumentEntity } from '../../documents/entities/document.entity';
import {
  AnalyticsQueryInput,
  AnalyticsResult,
  DataPoint,
  MetricValue,
  DateGranularity,
  MetricType,
  DashboardSummary,
  ObjectTypeStats,
  StatusDistribution,
  TimeSeriesDataPoint,
  TimeSeriesResult,
  FilterInput,
} from '../dto/analytics.dto';

@Injectable()
export class AnalyticsQueryService {
  private readonly logger = new Logger(AnalyticsQueryService.name);

  constructor(
    @InjectRepository(InstanceEntity)
    private readonly instanceRepository: Repository<InstanceEntity>,
    @InjectRepository(InstanceRelationshipEntity)
    private readonly relationshipRepository: Repository<InstanceRelationshipEntity>,
    @InjectRepository(ObjectTypeEntity)
    private readonly objectTypeRepository: Repository<ObjectTypeEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}

  /**
   * Execute analytics query with aggregations
   */
  async executeQuery(input: AnalyticsQueryInput): Promise<AnalyticsResult> {
    const startTime = Date.now();
    this.logger.log(`Executing analytics query: ${JSON.stringify(input)}`);

    try {
      const queryBuilder = this.instanceRepository.createQueryBuilder('instance');

      // Apply object type filter
      if (input.objectTypeIds?.length) {
        queryBuilder.andWhere('instance.objectTypeId IN (:...objectTypeIds)', {
          objectTypeIds: input.objectTypeIds,
        });
      }

      // Apply date range filter
      if (input.dateRange) {
        queryBuilder.andWhere('instance.createdAt >= :startDate', {
          startDate: new Date(input.dateRange.startDate),
        });
        queryBuilder.andWhere('instance.createdAt <= :endDate', {
          endDate: new Date(input.dateRange.endDate),
        });
      }

      // Apply custom filters
      if (input.filters?.length) {
        this.applyFilters(queryBuilder, input.filters);
      }

      // Build aggregations based on dimensions and metrics
      const data: DataPoint[] = [];
      const totals: MetricValue[] = [];

      if (input.dimensions?.length) {
        // Group by dimensions
        const groupedData = await this.executeGroupedQuery(queryBuilder, input);
        data.push(...groupedData);
      } else {
        // Simple aggregation without grouping
        const aggregatedMetrics = await this.executeSimpleAggregation(queryBuilder, input);
        data.push({
          dimensions: {},
          metrics: aggregatedMetrics,
        });
      }

      // Calculate totals
      const totalQueryBuilder = this.instanceRepository.createQueryBuilder('instance');
      if (input.objectTypeIds?.length) {
        totalQueryBuilder.andWhere('instance.objectTypeId IN (:...objectTypeIds)', {
          objectTypeIds: input.objectTypeIds,
        });
      }
      if (input.dateRange) {
        totalQueryBuilder.andWhere('instance.createdAt >= :startDate AND instance.createdAt <= :endDate', {
          startDate: new Date(input.dateRange.startDate),
          endDate: new Date(input.dateRange.endDate),
        });
      }

      for (const metric of input.metrics) {
        const total = await this.calculateMetric(totalQueryBuilder.clone(), metric);
        totals.push({
          name: metric.name,
          value: total,
          label: metric.label || metric.name,
          formattedValue: this.formatMetricValue(total, metric.type),
        });
      }

      const executionTimeMs = Date.now() - startTime;

      return {
        data,
        totals,
        rowCount: data.length,
        executionTimeMs,
        truncated: data.length >= (input.limit || 100),
      };
    } catch (error) {
      this.logger.error(`Analytics query failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Analytics query failed: ${error.message}`);
    }
  }

  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(dateRange?: { startDate: string; endDate: string }): Promise<DashboardSummary> {
    this.logger.log('Getting dashboard summary');

    try {
      // Get counts
      const [
        totalObjectTypes,
        totalInstances,
        totalDocuments,
        totalRelationships,
      ] = await Promise.all([
        this.objectTypeRepository.count({ where: { is_active: true } }),
        this.instanceRepository.count(),
        this.documentRepository.count(),
        this.relationshipRepository.count(),
      ]);

      // Get object type stats
      const objectTypeStats = await this.getObjectTypeStats();

      // Get instance status distribution
      const instanceStatusDistribution = await this.getStatusDistribution();

      // Get instances created over time (last 30 days by default)
      const instancesCreatedOverTime = await this.getInstancesOverTime(
        dateRange?.startDate || this.getDateDaysAgo(30),
        dateRange?.endDate || new Date().toISOString(),
      );

      // Workflow stats (mock for now - would need workflow module integration)
      const activeWorkflows = 0;
      const pendingWorkflows = 0;

      return {
        totalObjectTypes,
        totalInstances,
        totalDocuments,
        totalRelationships,
        activeWorkflows,
        pendingWorkflows,
        objectTypeStats,
        instanceStatusDistribution,
        instancesCreatedOverTime,
      };
    } catch (error) {
      this.logger.error(`Dashboard summary failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get dashboard summary: ${error.message}`);
    }
  }

  /**
   * Get time series data for a metric
   */
  async getTimeSeries(
    metricName: string,
    granularity: DateGranularity,
    startDate: string,
    endDate: string,
    objectTypeIds?: string[],
  ): Promise<TimeSeriesResult> {
    this.logger.log(`Getting time series: ${metricName}, ${granularity}`);

    const dateFormat = this.getDateFormat(granularity);

    const queryBuilder = this.instanceRepository
      .createQueryBuilder('instance')
      .select(`TO_CHAR(instance.createdAt, '${dateFormat}')`, 'period')
      .addSelect('COUNT(*)', 'count')
      .where('instance.createdAt >= :startDate', { startDate: new Date(startDate) })
      .andWhere('instance.createdAt <= :endDate', { endDate: new Date(endDate) })
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (objectTypeIds?.length) {
      queryBuilder.andWhere('instance.objectTypeId IN (:...objectTypeIds)', { objectTypeIds });
    }

    const results = await queryBuilder.getRawMany();

    const data: TimeSeriesDataPoint[] = results.map((row) => ({
      timestamp: row.period,
      value: parseInt(row.count, 10),
      label: row.period,
    }));

    return {
      metricName,
      data,
      granularity,
    };
  }

  // ==================== PRIVATE METHODS ====================

  private applyFilters(
    queryBuilder: SelectQueryBuilder<InstanceEntity>,
    filters: FilterInput[],
  ): void {
    filters.forEach((filter, index) => {
      const paramName = `filter_${index}`;

      // Handle JSON field filters (data.fieldName)
      if (filter.field.startsWith('data.')) {
        const jsonPath = filter.field.replace('data.', '');
        switch (filter.operator) {
          case 'eq':
            queryBuilder.andWhere(`instance.data->>'${jsonPath}' = :${paramName}`, {
              [paramName]: String(filter.value),
            });
            break;
          case 'ne':
            queryBuilder.andWhere(`instance.data->>'${jsonPath}' != :${paramName}`, {
              [paramName]: String(filter.value),
            });
            break;
          case 'contains':
            queryBuilder.andWhere(`instance.data->>'${jsonPath}' ILIKE :${paramName}`, {
              [paramName]: `%${filter.value}%`,
            });
            break;
          case 'in':
            if (Array.isArray(filter.value)) {
              queryBuilder.andWhere(`instance.data->>'${jsonPath}' IN (:...${paramName})`, {
                [paramName]: filter.value,
              });
            }
            break;
        }
      } else {
        // Handle regular column filters
        switch (filter.operator) {
          case 'eq':
            queryBuilder.andWhere(`instance.${filter.field} = :${paramName}`, {
              [paramName]: filter.value,
            });
            break;
          case 'ne':
            queryBuilder.andWhere(`instance.${filter.field} != :${paramName}`, {
              [paramName]: filter.value,
            });
            break;
          case 'gt':
            queryBuilder.andWhere(`instance.${filter.field} > :${paramName}`, {
              [paramName]: filter.value,
            });
            break;
          case 'lt':
            queryBuilder.andWhere(`instance.${filter.field} < :${paramName}`, {
              [paramName]: filter.value,
            });
            break;
          case 'gte':
            queryBuilder.andWhere(`instance.${filter.field} >= :${paramName}`, {
              [paramName]: filter.value,
            });
            break;
          case 'lte':
            queryBuilder.andWhere(`instance.${filter.field} <= :${paramName}`, {
              [paramName]: filter.value,
            });
            break;
          case 'in':
            if (Array.isArray(filter.value)) {
              queryBuilder.andWhere(`instance.${filter.field} IN (:...${paramName})`, {
                [paramName]: filter.value,
              });
            }
            break;
          case 'contains':
            queryBuilder.andWhere(`instance.${filter.field} ILIKE :${paramName}`, {
              [paramName]: `%${filter.value}%`,
            });
            break;
        }
      }
    });
  }

  private async executeGroupedQuery(
    queryBuilder: SelectQueryBuilder<InstanceEntity>,
    input: AnalyticsQueryInput,
  ): Promise<DataPoint[]> {
    const selects: string[] = [];
    const groupBys: string[] = [];

    // Add dimension columns
    for (const dim of input.dimensions || []) {
      if (dim.field === 'createdAt' && dim.granularity) {
        const format = this.getDateFormat(dim.granularity);
        selects.push(`TO_CHAR(instance.createdAt, '${format}') as "${dim.field}"`);
        groupBys.push(`TO_CHAR(instance.createdAt, '${format}')`);
      } else if (dim.field.startsWith('data.')) {
        const jsonPath = dim.field.replace('data.', '');
        selects.push(`instance.data->>'${jsonPath}' as "${dim.field}"`);
        groupBys.push(`instance.data->>'${jsonPath}'`);
      } else {
        selects.push(`instance.${dim.field} as "${dim.field}"`);
        groupBys.push(`instance.${dim.field}`);
      }
    }

    // Add metric aggregations
    for (const metric of input.metrics) {
      const aggFunc = this.getAggFunction(metric.type, metric.field);
      selects.push(`${aggFunc} as "${metric.name}"`);
    }

    queryBuilder
      .select(selects)
      .groupBy(groupBys.join(', '))
      .limit(input.limit || 100);

    const results = await queryBuilder.getRawMany();

    return results.map((row) => ({
      dimensions: Object.fromEntries(
        (input.dimensions || []).map((dim) => [dim.field, row[dim.field]]),
      ),
      metrics: input.metrics.map((metric) => ({
        name: metric.name,
        value: parseFloat(row[metric.name]) || 0,
        label: metric.label || metric.name,
        formattedValue: this.formatMetricValue(parseFloat(row[metric.name]) || 0, metric.type),
      })),
    }));
  }

  private async executeSimpleAggregation(
    queryBuilder: SelectQueryBuilder<InstanceEntity>,
    input: AnalyticsQueryInput,
  ): Promise<MetricValue[]> {
    const metrics: MetricValue[] = [];

    for (const metric of input.metrics) {
      const value = await this.calculateMetric(queryBuilder.clone(), metric);
      metrics.push({
        name: metric.name,
        value,
        label: metric.label || metric.name,
        formattedValue: this.formatMetricValue(value, metric.type),
      });
    }

    return metrics;
  }

  private async calculateMetric(
    queryBuilder: SelectQueryBuilder<InstanceEntity>,
    metric: { name: string; type: MetricType; field?: string },
  ): Promise<number> {
    const aggFunc = this.getAggFunction(metric.type, metric.field);
    const result = await queryBuilder
      .select(aggFunc, 'value')
      .getRawOne();

    return parseFloat(result?.value) || 0;
  }

  private getAggFunction(type: MetricType, field?: string): string {
    const columnRef = field?.startsWith('data.')
      ? `(instance.data->>'${field.replace('data.', '')}')::numeric`
      : field
        ? `instance.${field}`
        : '*';

    switch (type) {
      case MetricType.COUNT:
        return 'COUNT(*)';
      case MetricType.DISTINCT_COUNT:
        return `COUNT(DISTINCT ${columnRef})`;
      case MetricType.SUM:
        return `SUM(${columnRef})`;
      case MetricType.AVG:
        return `AVG(${columnRef})`;
      case MetricType.MIN:
        return `MIN(${columnRef})`;
      case MetricType.MAX:
        return `MAX(${columnRef})`;
      default:
        return 'COUNT(*)';
    }
  }

  private getDateFormat(granularity: DateGranularity): string {
    switch (granularity) {
      case DateGranularity.HOUR:
        return 'YYYY-MM-DD HH24:00';
      case DateGranularity.DAY:
        return 'YYYY-MM-DD';
      case DateGranularity.WEEK:
        return 'IYYY-IW';
      case DateGranularity.MONTH:
        return 'YYYY-MM';
      case DateGranularity.QUARTER:
        return 'YYYY-"Q"Q';
      case DateGranularity.YEAR:
        return 'YYYY';
      default:
        return 'YYYY-MM-DD';
    }
  }

  private formatMetricValue(value: number, type: MetricType): string {
    if (type === MetricType.COUNT || type === MetricType.DISTINCT_COUNT) {
      return value.toLocaleString();
    }
    if (type === MetricType.AVG) {
      return value.toFixed(2);
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  private async getObjectTypeStats(): Promise<ObjectTypeStats[]> {
    const objectTypes = await this.objectTypeRepository.find({
      where: { is_active: true },
      relations: ['fields'],
    });

    const stats: ObjectTypeStats[] = [];

    for (const ot of objectTypes) {
      const instanceCount = await this.instanceRepository.count({
        where: { objectTypeId: ot.id },
      });

      const relationshipCount = await this.relationshipRepository.count({
        where: [
          { sourceInstanceId: ot.id },
          { targetInstanceId: ot.id },
        ],
      });

      stats.push({
        id: ot.id,
        name: ot.name,
        instanceCount,
        fieldCount: ot.fields?.length || 0,
        relationshipCount,
      });
    }

    return stats.sort((a, b) => b.instanceCount - a.instanceCount);
  }

  private async getStatusDistribution(): Promise<StatusDistribution[]> {
    const result = await this.instanceRepository
      .createQueryBuilder('instance')
      .select('instance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('instance.status')
      .getRawMany();

    const total = result.reduce((sum, row) => sum + parseInt(row.count, 10), 0);

    return result.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
      percentage: total > 0 ? (parseInt(row.count, 10) / total) * 100 : 0,
    }));
  }

  private async getInstancesOverTime(startDate: string, endDate: string): Promise<TimeSeriesDataPoint[]> {
    const result = await this.instanceRepository
      .createQueryBuilder('instance')
      .select("TO_CHAR(instance.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('instance.createdAt >= :startDate', { startDate: new Date(startDate) })
      .andWhere('instance.createdAt <= :endDate', { endDate: new Date(endDate) })
      .groupBy("TO_CHAR(instance.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      timestamp: row.date,
      value: parseInt(row.count, 10),
      label: row.date,
    }));
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }
}
