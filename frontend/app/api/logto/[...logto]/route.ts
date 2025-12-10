import { handleAuthRoutes } from '@logto/next';
import { logtoConfig } from '@/lib/logto';

export const GET = handleAuthRoutes(logtoConfig);
