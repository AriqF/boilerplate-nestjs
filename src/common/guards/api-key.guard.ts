import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AppConfigService } from '../../config/app-config.service';
import { ErrorCode } from '../constants/error-code.enum';
import {
  API_KEY_HEADER,
  TIMESTAMP_HEADER,
} from '../constants/security.constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global guard: requires a valid `x-api-key` and a fresh `x-timestamp` on every route,
 * unless the handler/controller is marked @Public. Rejections surface as the standard
 * 401 error envelope (via AllExceptionsFilter).
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    this.validateApiKey(request);
    this.validateTimestamp(request);
    return true;
  }

  private validateApiKey(request: Request): void {
    const provided = request.header(API_KEY_HEADER);
    if (!provided) {
      throw this.unauthorized('Missing API key');
    }

    const matches = this.config.apiKeys.some((key) =>
      this.safeEqual(key, provided),
    );
    if (!matches) {
      throw this.unauthorized('Invalid API key');
    }
  }

  private validateTimestamp(request: Request): void {
    const raw = request.header(TIMESTAMP_HEADER);
    if (!raw) {
      throw this.unauthorized('Missing timestamp');
    }

    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) {
      throw this.unauthorized('Invalid timestamp');
    }

    const skewSeconds = Math.abs(Date.now() - timestamp) / 1000;
    if (skewSeconds > this.config.apiTimestampToleranceSec) {
      throw this.unauthorized('Request timestamp outside the allowed window');
    }
  }

  /** Length-checked, constant-time comparison to avoid leaking key contents via timing. */
  private safeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) {
      return false;
    }
    return timingSafeEqual(bufferA, bufferB);
  }

  private unauthorized(message: string): UnauthorizedException {
    return new UnauthorizedException({
      message,
      errorCode: ErrorCode.UNAUTHORIZED,
    });
  }
}
