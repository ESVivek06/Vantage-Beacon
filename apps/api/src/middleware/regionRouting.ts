import { Request, Response, NextFunction } from 'express';
import { Region, getClientForRegion } from '@vb/database';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../lib/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRegion?: Region;
      regionalDb?: PrismaClient;
    }
  }
}

/**
 * Extracts the JWT from the Authorization header, reads the `region` claim,
 * and attaches the correct regional PrismaClient to req.regionalDb.
 *
 * UK/EU user data must never be written to NA or IN clusters — this middleware
 * enforces that invariant on every authenticated REST request.
 */
export function regionRoutingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  try {
    const payload = verifyToken(authHeader.slice(7));
    req.userId = payload.sub;
    req.userRegion = payload.region;
    req.regionalDb = getClientForRegion(payload.region);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
