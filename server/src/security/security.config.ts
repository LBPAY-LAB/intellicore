/**
 * Security Configuration
 * Sprint 15 - US-072: Security Hardening
 *
 * Centralized security configuration for the application.
 */

export interface SecurityConfig {
  // Rate limiting
  rateLimit: {
    ttl: number; // Time window in seconds
    limit: number; // Max requests per window
    ignoreUserAgents: (string | RegExp)[];
  };

  // CORS
  cors: {
    origins: string[];
    methods: string[];
    credentials: boolean;
    maxAge: number;
  };

  // Helmet/CSP
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: string[];
        scriptSrc: string[];
        styleSrc: string[];
        imgSrc: string[];
        connectSrc: string[];
        fontSrc: string[];
        objectSrc: string[];
        mediaSrc: string[];
        frameSrc: string[];
      };
    };
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };

  // Audit logging
  audit: {
    enabled: boolean;
    logLevel: 'all' | 'mutations' | 'sensitive';
    retentionDays: number;
    sensitiveFields: string[];
  };
}

export function getSecurityConfig(): SecurityConfig {
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    rateLimit: {
      ttl: 60, // 1 minute window
      limit: isDev ? 1000 : 100, // 100 requests per minute in production
      ignoreUserAgents: [/health-check/i],
    },

    cors: {
      origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:5173').split(','),
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      maxAge: 86400, // 24 hours
    },

    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // GraphQL Playground needs these
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:*', 'https://localhost:*'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    },

    audit: {
      enabled: true,
      logLevel: 'mutations',
      retentionDays: 90,
      sensitiveFields: [
        'password',
        'cpf',
        'cnpj',
        'rg',
        'token',
        'secret',
        'apiKey',
        'creditCard',
        'cvv',
      ],
    },
  };
}
