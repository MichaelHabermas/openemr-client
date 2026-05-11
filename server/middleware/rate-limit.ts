import rateLimit from 'express-rate-limit';
import { apiErrorCodes } from '../errors/api-errors';

export function rateLimiter(opts?: { limit?: number; windowMs?: number }) {
  return rateLimit({
    windowMs: opts?.windowMs ?? 15 * 60 * 1000,
    limit: opts?.limit ?? 500,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: apiErrorCodes.rateLimited });
    },
  });
}
