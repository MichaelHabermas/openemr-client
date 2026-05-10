import type { RequestHandler } from 'express';
import { apiErrorCodes } from '../errors/api-errors';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

export function requireCustomHeader(): RequestHandler {
  return (req, res, next) => {
    if (MUTATION_METHODS.has(req.method) && !req.headers['x-requested-with']) {
      res.status(403).json({ error: apiErrorCodes.forbidden });
      return;
    }
    next();
  };
}
