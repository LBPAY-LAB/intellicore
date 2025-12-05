/**
 * Input Sanitization Utilities
 * Sprint 15 - US-072: Security Hardening
 *
 * Provides utilities for sanitizing user input to prevent
 * XSS, SQL injection, and other injection attacks.
 */

import { BadRequestException } from '@nestjs/common';

/**
 * Patterns that indicate potential injection attacks
 */
const DANGEROUS_PATTERNS = [
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b.*\b(FROM|INTO|SET|TABLE|DATABASE)\b)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/gi,

  // NoSQL injection patterns
  /(\$where|\$gt|\$lt|\$ne|\$eq|\$regex|\$or|\$and)/gi,

  // LDAP injection patterns
  /([)(|*\\])/g,

  // OS command injection patterns
  /(;|\||&|`|\$\(|>\s*\/|<\s*\/)/g,

  // Path traversal
  /(\.\.\/|\.\.\\)/g,
];

/**
 * HTML/Script patterns for XSS prevention
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi,
];

/**
 * Check if input contains potentially dangerous patterns
 */
export function containsDangerousInput(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0; // Reset regex state
      return true;
    }
  }

  return false;
}

/**
 * Check if input contains XSS patterns
 */
export function containsXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0; // Reset regex state
      return true;
    }
  }

  return false;
}

/**
 * Sanitize HTML entities
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return input;

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return input.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char]);
}

/**
 * Strip HTML tags from input
 */
export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== 'string') return input;
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize input by removing dangerous patterns
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return input;

  let sanitized = input;

  // Remove script tags and their content
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Escape remaining HTML
  sanitized = escapeHtml(sanitized);

  return sanitized.trim();
}

/**
 * Validate and sanitize an object's string properties
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    throwOnDangerous?: boolean;
    escapeHtml?: boolean;
    maxStringLength?: number;
  } = {},
): T {
  const {
    throwOnDangerous = true,
    escapeHtml: shouldEscapeHtml = false,
    maxStringLength = 10000,
  } = options;

  const sanitized: Record<string, unknown> = { ...obj };

  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      // Check length
      if (value.length > maxStringLength) {
        throw new BadRequestException(
          `Field "${key}" exceeds maximum length of ${maxStringLength}`,
        );
      }

      // Check for dangerous patterns
      if (throwOnDangerous && containsDangerousInput(value)) {
        throw new BadRequestException(
          `Field "${key}" contains potentially dangerous content`,
        );
      }

      // Check for XSS
      if (throwOnDangerous && containsXSS(value)) {
        throw new BadRequestException(
          `Field "${key}" contains potentially malicious HTML`,
        );
      }

      // Optionally escape HTML
      if (shouldEscapeHtml) {
        sanitized[key] = escapeHtml(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    }
  }

  return sanitized as T;
}

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate email format
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';

  // Remove path components
  let safe = filename.replace(/^.*[\\\/]/, '');

  // Remove dangerous characters
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Prevent hidden files
  if (safe.startsWith('.')) {
    safe = '_' + safe.slice(1);
  }

  // Limit length
  if (safe.length > 255) {
    const ext = safe.slice(safe.lastIndexOf('.'));
    safe = safe.slice(0, 255 - ext.length) + ext;
  }

  return safe;
}
