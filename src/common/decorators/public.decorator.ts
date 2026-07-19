import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/** Opt a route (or whole controller) out of the global ApiKeyGuard. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
