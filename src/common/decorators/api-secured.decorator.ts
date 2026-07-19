import { applyDecorators } from '@nestjs/common';
import { ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import {
  API_KEY_SECURITY,
  TIMESTAMP_SECURITY,
} from '../constants/security.constants';

/**
 * Documents a route as protected by the global ApiKeyGuard: attaches both security
 * schemes (so Swagger's Authorize box sends the headers) and the 401 response. Keeps
 * every protected route's docs consistent from one decorator.
 */
export function ApiSecuredEndpoint() {
  return applyDecorators(
    ApiSecurity(API_KEY_SECURITY),
    ApiSecurity(TIMESTAMP_SECURITY),
    ApiUnauthorizedResponse({
      description:
        'Missing/invalid API key, or timestamp outside the allowed window.',
    }),
  );
}
