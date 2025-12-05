/**
 * Security Module
 * Sprint 15 - US-072: Security Hardening
 *
 * Centralized security module with rate limiting, audit logging,
 * and security utilities.
 *
 * Note: GraphQL complexity plugin disabled temporarily for testing.
 * Re-enable after initial portal validation.
 */

import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { GqlThrottlerGuard } from './guards/gql-throttler.guard';
import { getSecurityConfig } from './security.config';

const securityConfig = getSecurityConfig();

@Global()
@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: securityConfig.rateLimit.ttl * 1000, // Convert to ms
        limit: securityConfig.rateLimit.limit,
      },
    ]),

    // Audit logging
    AuditModule,
  ],
  providers: [
    // Global rate limit guard (GraphQL-aware)
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },

    // Global audit interceptor for mutations
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditModule],
})
export class SecurityModule {}
