import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from '../../config/app-config.service';
import { ApiKeyGuard } from './api-key.guard';

const VALID_KEY = 'secret-key';
const TOLERANCE_SEC = 300;

function buildGuard(isPublic = false): ApiKeyGuard {
  const reflector = {
    getAllAndOverride: () => isPublic,
  } as unknown as Reflector;
  const config = {
    apiKeys: [VALID_KEY],
    apiTimestampToleranceSec: TOLERANCE_SEC,
  } as unknown as AppConfigService;
  return new ApiKeyGuard(reflector, config);
}

function contextWith(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) => headers[name.toLowerCase()],
      }),
    }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  it('allows @Public routes without any credentials', () => {
    expect(buildGuard(true).canActivate(contextWith({}))).toBe(true);
  });

  it('allows a valid key with a fresh timestamp', () => {
    const ctx = contextWith({
      'x-api-key': VALID_KEY,
      'x-timestamp': String(Date.now()),
    });
    expect(buildGuard().canActivate(ctx)).toBe(true);
  });

  it.each([
    ['missing API key', {}, 'Missing API key'],
    [
      'invalid API key',
      { 'x-api-key': 'wrong', 'x-timestamp': String(Date.now()) },
      'Invalid API key',
    ],
    ['missing timestamp', { 'x-api-key': VALID_KEY }, 'Missing timestamp'],
    [
      'non-numeric timestamp',
      { 'x-api-key': VALID_KEY, 'x-timestamp': 'not-a-number' },
      'Invalid timestamp',
    ],
    [
      'stale timestamp',
      {
        'x-api-key': VALID_KEY,
        'x-timestamp': String(Date.now() - (TOLERANCE_SEC + 60) * 1000),
      },
      'outside the allowed window',
    ],
  ])('rejects when %s', (_label, headers, expected) => {
    expect(() => buildGuard().canActivate(contextWith(headers))).toThrow(
      expected,
    );
  });

  it('throws UnauthorizedException carrying the UNAUTHORIZED errorCode', () => {
    try {
      buildGuard().canActivate(contextWith({}));
      throw new Error('expected guard to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      const payload = (error as UnauthorizedException).getResponse() as {
        errorCode: string;
      };
      expect(payload.errorCode).toBe('UNAUTHORIZED');
    }
  });
});
