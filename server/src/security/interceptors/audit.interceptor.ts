/**
 * Audit Interceptor
 * Sprint 15 - US-072: Security Hardening
 *
 * Automatically logs GraphQL mutations for audit trail.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';
import { AuditService, AuditAction, AuditSeverity, AuditContext } from '../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();

    // Only audit mutations
    if (info?.parentType?.name !== 'Mutation') {
      return next.handle();
    }

    const req = gqlContext.getContext()?.req;

    // Skip audit if no request context (e.g., internal calls)
    if (!req) {
      return next.handle();
    }

    const operationName = info.fieldName;
    const args = gqlContext.getArgs();

    // Build audit context
    const auditContext: AuditContext = {
      userId: req.user?.sub || req.user?.id,
      userEmail: req.user?.email,
      userRoles: req.user?.roles,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'],
      requestId: req.headers['x-request-id'] || this.generateRequestId(),
      graphqlOperation: operationName,
    };

    // Determine action type from operation name
    const action = this.getActionFromOperation(operationName);

    // Extract resource info from arguments
    const { resourceType, resourceId } = this.extractResourceInfo(operationName, args);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (result) => {
          // Log successful mutation - only log for mutation actions
          if (this.isMutationAction(action)) {
            await this.auditService.logMutation(
              action as AuditAction.CREATE | AuditAction.UPDATE | AuditAction.DELETE | AuditAction.RESTORE,
              resourceType,
              resourceId || result?.id,
              auditContext,
              undefined, // previousValues - would need entity hooks for this
              args.input || args,
            );
          }
        },
        error: async (error) => {
          // Log failed mutation attempt
          await this.auditService.log({
            action,
            severity: AuditSeverity.WARNING,
            resourceType,
            resourceId,
            context: auditContext,
            details: {
              error: error.message,
              duration: Date.now() - startTime,
            },
          });
        },
      }),
    );
  }

  private getActionFromOperation(operationName: string): AuditAction {
    const lowerName = operationName.toLowerCase();

    if (lowerName.startsWith('create') || lowerName.startsWith('add')) {
      return AuditAction.CREATE;
    }
    if (lowerName.startsWith('update') || lowerName.startsWith('edit') || lowerName.startsWith('modify')) {
      return AuditAction.UPDATE;
    }
    if (lowerName.startsWith('delete') || lowerName.startsWith('remove')) {
      return AuditAction.DELETE;
    }
    if (lowerName.startsWith('restore')) {
      return AuditAction.RESTORE;
    }

    return AuditAction.UPDATE; // Default to UPDATE for unknown mutations
  }

  private extractResourceInfo(
    operationName: string,
    args: any,
  ): { resourceType: string; resourceId: string | undefined } {
    // Extract resource type from operation name
    // e.g., createObjectType -> ObjectType, updateInstance -> Instance
    const resourceType = operationName
      .replace(/^(create|update|delete|restore|add|remove|edit|modify)/, '')
      .replace(/^[a-z]/, (c) => c.toUpperCase());

    // Extract resource ID from args
    const resourceId = args.id || args.input?.id;

    return { resourceType: resourceType || 'Unknown', resourceId };
  }

  private getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private isMutationAction(action: AuditAction): boolean {
    return [
      AuditAction.CREATE,
      AuditAction.UPDATE,
      AuditAction.DELETE,
      AuditAction.RESTORE,
    ].includes(action);
  }
}
