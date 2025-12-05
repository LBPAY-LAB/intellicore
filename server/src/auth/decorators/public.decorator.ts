import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a resolver as public (no authentication required)
 * Usage: @Public() on resolver methods
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
