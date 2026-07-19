/**
 * Augment Express' Request with the per-request id set by requestIdMiddleware,
 * so the interceptor and exception filter can read `request.id` type-safely.
 */
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export {};
