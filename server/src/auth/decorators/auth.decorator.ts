import { UseGuards, applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorator to protect GraphQL resolvers with JWT authentication and optional role-based authorization
 * Usage:
 *   @Auth() - Only authentication required
 *   @Auth('admin', 'manager') - Authentication + specific roles required
 */
export function Auth(...roles: string[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];

  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }

  return applyDecorators(...decorators);
}
