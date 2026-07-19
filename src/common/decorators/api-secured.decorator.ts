import { applyDecorators } from '@nestjs/common';
import { ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { API_KEY_SECURITY } from '../constants/security.constants';

/**
 * Documents a route as protected by the global ApiKeyGuard: attaches the API-key security
 * scheme (so Swagger's Authorize box sends x-api-key) and the 401 response. The x-timestamp
 * header is auto-injected by the Swagger requestInterceptor, so it is not a manual scheme.
 */
export function ApiSecuredEndpoint() {
  return applyDecorators(
    ApiSecurity(API_KEY_SECURITY),
    ApiUnauthorizedResponse({
      description:
        'Missing/invalid API key, or timestamp outside the allowed window.',
    }),
  );
}
