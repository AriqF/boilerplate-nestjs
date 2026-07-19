import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

/**
 * Assigns a request id (honouring an inbound `x-request-id`, else a fresh UUID) and
 * echoes it back as a header. Registered via `app.use()` so it runs before guards —
 * ensuring `request.id` is available even when a guard rejects the request.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const inbound = req.headers['x-request-id'];
  const id =
    typeof inbound === 'string' && inbound.length > 0 ? inbound : randomUUID();

  req.id = id;
  res.setHeader('x-request-id', id);
  next();
}
