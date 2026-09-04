import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import express, { type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { consumerProfiles, platformUsers, sellerProfiles, technicianProfiles } from '../../db/schema';
import { requireDevelopmentActor } from '../../middleware/development-actor';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';
import type { ActorRole } from '../../shared/types/actor';

const scrypt = promisify(scryptCallback);
const roles = ['consumer', 'technician', 'seller'] as const;
const registerSchema = z.object({ email: z.string().email().max(255).transform((email) => email.trim().toLowerCase()), password: z.string().min(8).max(128), displayName: z.string().trim().min(2).max(120), role: z.enum(roles) });
const loginSchema = z.object({ email: z.string().email().max(255).transform((email) => email.trim().toLowerCase()), password: z.string().min(1).max(128) });
const tokenSchema = z.object({ sub: z.string().uuid(), name: z.string(), role: z.enum(['consumer', 'technician', 'seller', 'admin']), exp: z.number().int() });
const router = express.Router();

const secret = () => {
  const value = process.env.AUTH_TOKEN_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') throw new ApiError(500, 'AUTH_TOKEN_SECRET must be configured in production');
  return 'repair-link-local-development-secret-change-before-production';
};
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signToken = (user: { id: string; displayName: string; primaryRole: ActorRole }) => {
  const payload = { sub: user.id, name: user.displayName, role: user.primaryRole, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  const body = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  return `${body}.${createHmac('sha256', secret()).update(body).digest('base64url')}`;
};
const verifyPassword = async (password: string, stored: string) => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = Buffer.from(await scrypt(password, salt, 64) as ArrayBuffer);
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
};
const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = Buffer.from(await scrypt(password, salt, 64) as ArrayBuffer).toString('hex');
  return `${salt}:${hash}`;
};
const publicUser = (user: { id: string; email: string; displayName: string; primaryRole: ActorRole }) => ({ id: user.id, email: user.email, name: user.displayName, role: user.primaryRole });
const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => { try { return sendSuccess(res, 200, 'OK', await fn(req)); } catch (error) { return sendError(res, error instanceof ApiError ? error.statusCode : 400, error instanceof Error ? error.message : 'Authentication request failed'); } };

export const readBearerActor = (authorization: string | string[] | undefined) => {
  const value = typeof authorization === 'string' ? authorization : undefined;
  if (!value?.startsWith('Bearer ')) return undefined;
  const [header, payload, signature] = value.slice(7).split('.');
  if (!header || !payload || !signature) return undefined;
  const expected = createHmac('sha256', secret()).update(`${header}.${payload}`).digest();
  const provided = Buffer.from(signature, 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return undefined;
  try {
    const decoded = tokenSchema.parse(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')));
    if (decoded.exp <= Math.floor(Date.now() / 1000)) return undefined;
    return { id: decoded.sub, name: decoded.name, role: decoded.role, storeName: undefined };
  } catch { return undefined; }
};

router.post('/api/v1/auth/register', handle(async (req) => {
  const input = registerSchema.parse(req.body);
  const [existing] = await db.select({ id: platformUsers.id }).from(platformUsers).where(eq(platformUsers.email, input.email));
  if (existing) throw new ApiError(409, 'An account already exists for this email');
  const passwordHash = await hashPassword(input.password);
  const [user] = await db.insert(platformUsers).values({ email: input.email, passwordHash, displayName: input.displayName, primaryRole: input.role }).returning();
  if (input.role === 'consumer') await db.insert(consumerProfiles).values({ userId: user.id });
  if (input.role === 'technician') await db.insert(technicianProfiles).values({ userId: user.id, businessName: input.displayName, serviceArea: 'Not set', verificationStatus: 'pending' });
  if (input.role === 'seller') await db.insert(sellerProfiles).values({ userId: user.id, storeName: input.displayName, verificationStatus: 'pending' });
  return { token: signToken(user), user: publicUser(user) };
}));

router.post('/api/v1/auth/login', handle(async (req) => {
  const input = loginSchema.parse(req.body);
  const [user] = await db.select().from(platformUsers).where(eq(platformUsers.email, input.email));
  if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'This account is inactive');
  return { token: signToken(user), user: publicUser(user) };
}));

router.get('/api/v1/auth/me', requireDevelopmentActor, handle(async (req) => {
  if (!req.devActor) throw new ApiError(401, 'Authentication is required');
  const [user] = await db.select().from(platformUsers).where(eq(platformUsers.id, req.devActor.id));
  if (!user || !user.isActive) throw new ApiError(401, 'Account is unavailable');
  return { user: publicUser(user) };
}));

export default router;
