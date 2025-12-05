/**
 * Report Entities
 * Sprint 14 - US-068, US-071: Report Generation & Scheduled Reports
 *
 * Database entities for report definitions and executions.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ExportFormat, ReportFrequency, ReportStatus } from '../dto/analytics.dto';

@Entity('report_definitions')
@Index(['isActive', 'nextRunAt'])
export class ReportDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb' })
  query: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ExportFormat,
    default: ExportFormat.CSV,
  })
  format: ExportFormat;

  @Column({ type: 'jsonb', nullable: true })
  columns: string[] | null;

  @Column({
    type: 'enum',
    enum: ReportFrequency,
    nullable: true,
  })
  frequency: ReportFrequency | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cronExpression: string | null;

  @Column({ type: 'jsonb', nullable: true })
  recipients: string[] | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastRunAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextRunAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ReportExecutionEntity, (execution) => execution.report)
  executions: ReportExecutionEntity[];
}

@Entity('report_executions')
@Index(['reportId', 'startedAt'])
@Index(['status', 'startedAt'])
export class ReportExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reportId: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  downloadUrl: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'int', nullable: true })
  rowCount: number | null;

  @Column({ type: 'bigint', nullable: true })
  fileSizeBytes: number | null;

  @Column({ type: 'timestamp with time zone' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'float', nullable: true })
  executionTimeMs: number | null;

  @Column({ type: 'uuid', nullable: true })
  triggeredBy: string | null;

  // Relations
  report: ReportDefinitionEntity;
}

@Entity('export_files')
@Index(['expiresAt'])
export class ExportFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  filename: string;

  @Column({ type: 'text' })
  filePath: string;

  @Column({ type: 'text' })
  downloadUrl: string;

  @Column({
    type: 'enum',
    enum: ExportFormat,
  })
  format: ExportFormat;

  @Column({ type: 'int' })
  rowCount: number;

  @Column({ type: 'bigint' })
  fileSizeBytes: number;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
