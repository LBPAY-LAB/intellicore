/**
 * Export Service
 * Sprint 14 - US-069: Data Export (CSV, Excel)
 *
 * Service for exporting analytics data to various formats.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ExportDataInput,
  ExportResult,
  ExportFormat,
  FilterInput,
} from '../dto/analytics.dto';
import { ExportFileEntity } from '../entities/report.entity';
import { InstanceEntity } from '../../instances/entities/instance.entity';
import { AnalyticsConfig } from '../analytics.config';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly config: AnalyticsConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ExportFileEntity)
    private readonly exportFileRepository: Repository<ExportFileEntity>,
    @InjectRepository(InstanceEntity)
    private readonly instanceRepository: Repository<InstanceEntity>,
  ) {
    this.config = this.configService.get<AnalyticsConfig>('analytics')!;
    this.ensureExportDir();
  }

  /**
   * Export instances data to file
   */
  async exportData(input: ExportDataInput, userId?: string): Promise<ExportResult> {
    this.logger.log(`Exporting data: ${JSON.stringify(input)}`);

    try {
      // Fetch data
      const data = await this.fetchExportData(input);

      if (data.length === 0) {
        throw new BadRequestException('No data to export');
      }

      if (data.length > this.config.exportMaxRows) {
        throw new BadRequestException(
          `Export exceeds maximum row limit of ${this.config.exportMaxRows}`,
        );
      }

      // Generate filename
      const filename = input.filename || `export_${Date.now()}`;
      const extension = this.getFileExtension(input.format);
      const fullFilename = `${filename}.${extension}`;

      // Generate file content
      const content = await this.generateFileContent(data, input);

      // Save file
      const filePath = path.join(this.config.exportTempDir, `${uuidv4()}_${fullFilename}`);
      fs.writeFileSync(filePath, content);

      const stats = fs.statSync(filePath);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.config.exportRetentionHours);

      // Create download URL (in real implementation, this would be a presigned URL)
      const downloadUrl = `/api/exports/${path.basename(filePath)}`;

      // Save export record
      const exportFile = this.exportFileRepository.create({
        filename: fullFilename,
        filePath,
        downloadUrl,
        format: input.format,
        rowCount: data.length,
        fileSizeBytes: stats.size,
        expiresAt,
        createdBy: userId,
      });

      const saved = await this.exportFileRepository.save(exportFile);

      this.logger.log(`Export completed: ${fullFilename}, ${data.length} rows, ${stats.size} bytes`);

      return {
        id: saved.id,
        filename: fullFilename,
        downloadUrl,
        format: input.format,
        rowCount: data.length,
        fileSizeBytes: stats.size,
        expiresAt,
        createdAt: saved.createdAt,
      };
    } catch (error) {
      this.logger.error(`Export failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Export failed: ${error.message}`);
    }
  }

  /**
   * Get export file by ID
   */
  async getExportFile(id: string): Promise<ExportFileEntity | null> {
    return this.exportFileRepository.findOne({ where: { id } });
  }

  /**
   * Get file content for download
   */
  async getFileContent(id: string): Promise<{ content: Buffer; filename: string; mimeType: string }> {
    const exportFile = await this.exportFileRepository.findOne({ where: { id } });

    if (!exportFile) {
      throw new BadRequestException('Export file not found');
    }

    if (new Date() > exportFile.expiresAt) {
      throw new BadRequestException('Export file has expired');
    }

    if (!fs.existsSync(exportFile.filePath)) {
      throw new BadRequestException('Export file not found on disk');
    }

    const content = fs.readFileSync(exportFile.filePath);
    const mimeType = this.getMimeType(exportFile.format);

    return {
      content,
      filename: exportFile.filename,
      mimeType,
    };
  }

  /**
   * Clean up expired export files
   */
  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await this.exportFileRepository.find({
      where: { expiresAt: LessThan(new Date()) },
    });

    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
        await this.exportFileRepository.delete(file.id);
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to delete expired file ${file.id}: ${error.message}`);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} expired export files`);
    return deletedCount;
  }

  // ==================== PRIVATE METHODS ====================

  private ensureExportDir(): void {
    if (!fs.existsSync(this.config.exportTempDir)) {
      fs.mkdirSync(this.config.exportTempDir, { recursive: true });
    }
  }

  private async fetchExportData(input: ExportDataInput): Promise<Record<string, unknown>[]> {
    const queryBuilder = this.instanceRepository
      .createQueryBuilder('instance')
      .leftJoinAndSelect('instance.objectType', 'objectType');

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

    queryBuilder.orderBy('instance.createdAt', 'DESC');
    queryBuilder.take(this.config.exportMaxRows);

    const instances = await queryBuilder.getMany();

    // Flatten data for export
    return instances.map((instance) => ({
      id: instance.id,
      objectType: instance.objectType?.name || '',
      objectTypeId: instance.objectTypeId,
      displayName: instance.displayName,
      status: instance.status,
      isActive: instance.isActive,
      createdAt: instance.createdAt?.toISOString(),
      updatedAt: instance.updatedAt?.toISOString(),
      createdBy: instance.createdBy,
      ...this.flattenData(instance.data || {}, 'data'),
    }));
  }

  private flattenData(data: Record<string, unknown>, prefix: string): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const flatKey = `${prefix}.${key}`;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenData(value as Record<string, unknown>, flatKey));
      } else {
        flattened[flatKey] = value;
      }
    }

    return flattened;
  }

  private applyFilters(queryBuilder: any, filters: FilterInput[]): void {
    filters.forEach((filter, index) => {
      const paramName = `filter_${index}`;

      if (filter.field.startsWith('data.')) {
        const jsonPath = filter.field.replace('data.', '');
        switch (filter.operator) {
          case 'eq':
            queryBuilder.andWhere(`instance.data->>'${jsonPath}' = :${paramName}`, {
              [paramName]: String(filter.value),
            });
            break;
          case 'contains':
            queryBuilder.andWhere(`instance.data->>'${jsonPath}' ILIKE :${paramName}`, {
              [paramName]: `%${filter.value}%`,
            });
            break;
        }
      } else {
        switch (filter.operator) {
          case 'eq':
            queryBuilder.andWhere(`instance.${filter.field} = :${paramName}`, {
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
        }
      }
    });
  }

  private async generateFileContent(
    data: Record<string, unknown>[],
    input: ExportDataInput,
  ): Promise<string | Buffer> {
    // Get columns to export
    let columns = input.columns;
    if (!columns?.length && data.length > 0) {
      columns = Object.keys(data[0]);
    }

    switch (input.format) {
      case ExportFormat.CSV:
        return this.generateCsv(data, columns!);
      case ExportFormat.JSON:
        return this.generateJson(data, columns!);
      case ExportFormat.EXCEL:
        return this.generateExcel(data, columns!);
      case ExportFormat.PDF:
        return this.generatePdf(data, columns!);
      default:
        return this.generateCsv(data, columns!);
    }
  }

  private generateCsv(data: Record<string, unknown>[], columns: string[]): string {
    const header = columns.map((col) => `"${col}"`).join(',');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return String(value);
        })
        .join(','),
    );

    return [header, ...rows].join('\n');
  }

  private generateJson(data: Record<string, unknown>[], columns: string[]): string {
    const filtered = data.map((row) =>
      Object.fromEntries(columns.map((col) => [col, row[col]])),
    );
    return JSON.stringify(filtered, null, 2);
  }

  private generateExcel(data: Record<string, unknown>[], columns: string[]): Buffer {
    // Simple XLSX generation (using basic format)
    // In production, use a library like xlsx or exceljs
    const csv = this.generateCsv(data, columns);
    return Buffer.from(csv, 'utf-8');
  }

  private generatePdf(data: Record<string, unknown>[], columns: string[]): Buffer {
    // Simple PDF generation (placeholder)
    // In production, use a library like pdfkit or puppeteer
    const content = `Data Export Report\n\nGenerated: ${new Date().toISOString()}\nRows: ${data.length}\n\n`;
    const table = this.generateCsv(data, columns);
    return Buffer.from(content + table, 'utf-8');
  }

  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.CSV:
        return 'csv';
      case ExportFormat.JSON:
        return 'json';
      case ExportFormat.EXCEL:
        return 'xlsx';
      case ExportFormat.PDF:
        return 'pdf';
      default:
        return 'csv';
    }
  }

  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.CSV:
        return 'text/csv';
      case ExportFormat.JSON:
        return 'application/json';
      case ExportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ExportFormat.PDF:
        return 'application/pdf';
      default:
        return 'text/plain';
    }
  }
}
