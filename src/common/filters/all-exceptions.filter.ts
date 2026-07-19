import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-code.enum';
import { ErrorResponse } from '../dto/response.dto';

interface NormalizedError {
  status: HttpStatus;
  message: string;
  errorCode: string;
  errors?: string[];
}

/** Maps any thrown error (HttpException or otherwise) to the standard error envelope. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { status, message, errorCode, errors } = this.normalize(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} [${request.id}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      errorCode,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.id,
    };

    response.status(status).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (!(exception instanceof HttpException)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        errorCode: ErrorCode.INTERNAL_ERROR,
      };
    }

    const status = exception.getStatus();
    const res = exception.getResponse();
    let message = exception.message;
    let errorCode: string = this.statusToErrorCode(status);
    let errors: string[] | undefined;

    if (typeof res === 'string') {
      message = res;
    } else if (typeof res === 'object' && res !== null) {
      const payload = res as Record<string, unknown>;

      if (Array.isArray(payload.message)) {
        errors = payload.message.map((item) => String(item));
        message = 'Validation failed';
        errorCode = ErrorCode.VALIDATION_ERROR;
      } else if (typeof payload.message === 'string') {
        message = payload.message;
      }

      if (typeof payload.errorCode === 'string') {
        errorCode = payload.errorCode;
      }
    }

    return { status, message, errorCode, errors };
  }

  private statusToErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.UNPROCESSABLE_ENTITY;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.TOO_MANY_REQUESTS;
      default:
        return status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? ErrorCode.INTERNAL_ERROR
          : ErrorCode.BAD_REQUEST;
    }
  }
}
