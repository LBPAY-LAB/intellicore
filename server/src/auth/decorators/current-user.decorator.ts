import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface CurrentUserData {
  userId: string;
  email?: string;
  username?: string;
  roles: string[];
}

/**
 * Decorator to get the current authenticated user in GraphQL resolvers
 * Usage: @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): CurrentUserData => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
