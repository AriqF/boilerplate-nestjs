/** Standard success envelope produced by TransformInterceptor. */
export interface SuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  /** Optional extra info (pagination, counts, …). */
  meta?: Record<string, unknown>;
  timestamp: string;
  path: string;
  requestId: string;
}

/** Standard error envelope produced by AllExceptionsFilter. */
export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  /** Stable machine-readable code (see ErrorCode). */
  errorCode: string;
  /** Field-level details, e.g. flattened class-validator messages. */
  errors?: string[];
  timestamp: string;
  path: string;
  requestId: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
