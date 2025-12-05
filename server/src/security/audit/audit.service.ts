/**
 * Audit Logging Service
 * Sprint 15 - US-072: Security Hardening
 *
 * Centralized audit logging for security events and data mutations.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './audit-log.entity';

export enum AuditAction {
  // Authentication events
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',

  // Data mutations
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',

  // Sensitive data access
  VIEW_SENSITIVE = 'VIEW_SENSITIVE',
  EXPORT_DATA = 'EXPORT_DATA',
  BULK_OPERATION = 'BULK_OPERATION',

  // Security events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  userRoles?: string[];
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  graphqlOperation?: string;
}

export interface AuditEntry {
  action: AuditAction;
  severity: AuditSeverity;
  resourceType: string;
  resourceId?: string;
  context: AuditContext;
  details?: Record<string, any>;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly sensitiveFields = new Set([
    'password',
    'cpf',
    'cnpj',
    'rg',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'cvv',
    'ssn',
  ]);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
  ) {}

  /**
   * Log an audit event
   */
  async log(entry: AuditEntry): Promise<AuditLogEntity> {
    // Sanitize sensitive data
    const sanitizedEntry = this.sanitizeEntry(entry);

    const auditLog = this.auditRepository.create({
      action: sanitizedEntry.action,
      severity: sanitizedEntry.severity,
      resourceType: sanitizedEntry.resourceType,
      resourceId: sanitizedEntry.resourceId,
      userId: sanitizedEntry.context.userId,
      userEmail: sanitizedEntry.context.userEmail,
      userRoles: sanitizedEntry.context.userRoles,
      ipAddress: sanitizedEntry.context.ipAddress,
      userAgent: sanitizedEntry.context.userAgent,
      requestId: sanitizedEntry.context.requestId,
      graphqlOperation: sanitizedEntry.context.graphqlOperation,
      details: sanitizedEntry.details,
      previousValues: sanitizedEntry.previousValues,
      newValues: sanitizedEntry.newValues,
    });

    try {
      const saved = await this.auditRepository.save(auditLog);

      // Log to console for critical events
      if (entry.severity === AuditSeverity.CRITICAL) {
        this.logger.warn(
          `CRITICAL AUDIT: ${entry.action} on ${entry.resourceType} by ${entry.context.userEmail || 'anonymous'}`,
        );
      }

      return saved;
    } catch (error) {
      // Never fail the request due to audit logging
      this.logger.error(`Failed to save audit log: ${error.message}`);
      return auditLog;
    }
  }

  /**
   * Log authentication event
   */
  async logAuth(
    action: AuditAction.LOGIN | AuditAction.LOGOUT | AuditAction.LOGIN_FAILED | AuditAction.TOKEN_REFRESH,
    context: AuditContext,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      action,
      severity: action === AuditAction.LOGIN_FAILED ? AuditSeverity.WARNING : AuditSeverity.INFO,
      resourceType: 'AUTH',
      context,
      details,
    });
  }

  /**
   * Log data mutation
   */
  async logMutation(
    action: AuditAction.CREATE | AuditAction.UPDATE | AuditAction.DELETE | AuditAction.RESTORE,
    resourceType: string,
    resourceId: string,
    context: AuditContext,
    previousValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      action,
      severity: action === AuditAction.DELETE ? AuditSeverity.WARNING : AuditSeverity.INFO,
      resourceType,
      resourceId,
      context,
      previousValues,
      newValues,
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    action: AuditAction.RATE_LIMIT_EXCEEDED | AuditAction.UNAUTHORIZED_ACCESS | AuditAction.PERMISSION_DENIED,
    context: AuditContext,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      action,
      severity: AuditSeverity.CRITICAL,
      resourceType: 'SECURITY',
      context,
      details,
    });
  }

  /**
   * Log sensitive data access
   */
  async logSensitiveAccess(
    resourceType: string,
    resourceId: string,
    context: AuditContext,
    accessedFields: string[],
  ): Promise<void> {
    await this.log({
      action: AuditAction.VIEW_SENSITIVE,
      severity: AuditSeverity.WARNING,
      resourceType,
      resourceId,
      context,
      details: { accessedFields },
    });
  }

  /**
   * Query audit logs
   */
  async queryLogs(
    filters: {
      action?: AuditAction;
      resourceType?: string;
      resourceId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      severity?: AuditSeverity;
    },
    limit = 100,
    offset = 0,
  ): Promise<{ logs: AuditLogEntity[]; total: number }> {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }
    if (filters.resourceType) {
      query.andWhere('audit.resourceType = :resourceType', { resourceType: filters.resourceType });
    }
    if (filters.resourceId) {
      query.andWhere('audit.resourceId = :resourceId', { resourceId: filters.resourceId });
    }
    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    if (filters.severity) {
      query.andWhere('audit.severity = :severity', { severity: filters.severity });
    }
    if (filters.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('audit.createdAt', 'DESC');
    query.skip(offset).take(limit);

    const [logs, total] = await query.getManyAndCount();
    return { logs, total };
  }

  /**
   * Get audit trail for a specific resource
   */
  async getResourceAuditTrail(
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLogEntity[]> {
    return this.auditRepository.find({
      where: { resourceType, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Sanitize sensitive data from entry
   */
  private sanitizeEntry(entry: AuditEntry): AuditEntry {
    return {
      ...entry,
      details: entry.details ? this.sanitizeObject(entry.details) : undefined,
      previousValues: entry.previousValues ? this.sanitizeObject(entry.previousValues) : undefined,
      newValues: entry.newValues ? this.sanitizeObject(entry.newValues) : undefined,
    };
  }

  /**
   * Recursively sanitize sensitive fields from object
   */
  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (this.sensitiveFields.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
