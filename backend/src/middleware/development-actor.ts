import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../shared/api-response';
import { actorRoles, type ActorRole, type DevelopmentActor } from '../shared/types/actor';

const readHeader = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value.trim() : undefined;

/**
 * Enables explicit request actors only while running locally. This middleware
 * deliberately has no fallback identity: clients must declare who is acting.
 */
export const requireDevelopmentActor = (req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    next(new ApiError(503, 'Authentication is required outside local development'));
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
