/**
 * Audit Log Entity
 * Sprint 15 - US-072: Security Hardening
 *
 * Database entity for storing audit logs.
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['resourceType', 'resourceId'])
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['severity'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 20 })
  severity: string;

  @Column({ type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  userRoles: string[];

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'uuid', nullable: true })
  requestId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  graphqlOperation: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  previousValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
