import type { NextFunction, Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from '../shared/api-response';
import { actorRoles, type ActorRole, type DevelopmentActor } from '../shared/types/actor';

const readHeader = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value.trim() : undefined;

/**
 * Enables explicit request actors only while running locally. This middleware
 * deliberately has no fallback identity: clients must declare who is acting.
 */
export const requireDevelopmentActor = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = readHeader(req.headers.authorization);
  if (authorization?.startsWith('Bearer ')) {
    const [header, payload, signature] = authorization.slice(7).split('.');
    const signingSecret = process.env.AUTH_TOKEN_SECRET ?? (process.env.NODE_ENV === 'production' ? undefined : 'repair-link-local-development-secret-change-before-production');
    if (header && payload && signature && signingSecret) {
      const expected = createHmac('sha256', signingSecret).update(`${header}.${payload}`).digest();
      const provided = Buffer.from(signature, 'base64url');
      try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string; name?: string; role?: string; exp?: number };
        if (provided.length === expected.length && timingSafeEqual(provided, expected) && decoded.sub && decoded.name && decoded.exp && decoded.exp > Math.floor(Date.now() / 1000) && actorRoles.includes(decoded.role as ActorRole)) {
          req.devActor = { id: decoded.sub, name: decoded.name, role: decoded.role as ActorRole };
          next();
          return;
        }
      } catch { /* Fall through to the standard unauthorized response. */ }
    }
    next(new ApiError(401, 'Invalid or expired access token'));
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    next(new ApiError(401, 'Authentication is required'));
    return;
  }

  const id = readHeader(req.headers['x-dev-actor-id']);
  const name = readHeader(req.headers['x-dev-actor-name']);
  const candidateRole = readHeader(req.headers['x-dev-actor-role']);

  if (!id || !name || !candidateRole || !actorRoles.includes(candidateRole as ActorRole)) {
    next(new ApiError(401, 'Development actor headers are required', [
      'Send x-dev-actor-id, x-dev-actor-name, and x-dev-actor-role (consumer, technician, seller, or admin).',
    ]));
    return;
  }

  const actor: DevelopmentActor = {
    id,
    name,
    role: candidateRole as ActorRole,
    storeName: readHeader(req.headers['x-dev-store-name']),
  };
  req.devActor = actor;
  next();
};
