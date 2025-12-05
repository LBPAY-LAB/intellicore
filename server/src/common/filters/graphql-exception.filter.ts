import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

/**
 * Global GraphQL exception filter
 * Transforms HTTP exceptions into properly formatted GraphQL errors
 * with standardized error codes and i18n-ready messages
 */
@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const status = exception?.status || 500;
    let message = exception?.message || 'Internal server error';
    let validationErrors = undefined;

    // Handle validation errors from class-validator
    if (exception?.response?.message && Array.isArray(exception.response.message)) {
      validationErrors = exception.response.message;
      message = 'Validation failed';
    }

    // Log the error for debugging (avoid logging in production for sensitive data)
    if (status >= 500) {
      this.logger.error('GraphQL Error:', {
        status,
        message,
        stack: exception?.stack,
        validationErrors,
      });
    } else {
      this.logger.warn('GraphQL Warning:', {
        status,
        message,
        validationErrors,
      });
    }

    // Return formatted GraphQL error
    return new GraphQLError(message, {
      extensions: {
        code: this.getErrorCode(status, exception),
        status,
        timestamp: new Date().toISOString(),
        ...(validationErrors && { validationErrors }),
        // Include original error name for better error handling on client side
        ...(exception?.name && { originalError: exception.name }),
      },
    });
  }

  /**
   * Map HTTP status codes to GraphQL error codes
   * Following Apollo Server error code conventions
   */
  private getErrorCode(status: number, exception: any): string {
    // Check for specific exception types first
    if (exception?.name === 'ConflictException' || status === 409) {
      return 'CONFLICT';
    }

    // Standard HTTP status to GraphQL error code mapping
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
