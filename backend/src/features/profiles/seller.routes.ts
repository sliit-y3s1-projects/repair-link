import express, { type Request, type Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { sellerProfiles } from '../../db/schema';
import { requireDevelopmentActor } from '../../middleware/development-actor';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';

const createSchema = z.object({ storeName: z.string().min(2).max(160), description: z.string().max(5000).optional(), serviceArea: z.string().max(255).optional() });
const updateSchema = createSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');
const router = express.Router();
const actor = (req: Request) => { if (!req.devActor) throw new ApiError(401, 'Development actor is required'); return req.devActor; };
const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => { try { return sendSuccess(res, 200, 'OK', await fn(req)); } catch (error) { return sendError(res, error instanceof ApiError ? error.statusCode : 400, error instanceof Error ? error.message : 'Seller profile request failed'); } };

router.get('/api/v1/seller-profiles', handle(async () => db.select().from(sellerProfiles).where(eq(sellerProfiles.verificationStatus, 'verified')).orderBy(desc(sellerProfiles.createdAt))));
router.get('/api/v1/seller-profiles/:id', handle(async (req) => { const [row] = await db.select().from(sellerProfiles).where(and(eq(sellerProfiles.userId, req.params.id), eq(sellerProfiles.verificationStatus, 'verified'))); if (!row) throw new ApiError(404, 'Seller profile not found'); return row; }));
router.post('/api/v1/seller-profiles', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'seller') throw new ApiError(403, 'Only sellers can create seller profiles'); const [row] = await db.insert(sellerProfiles).values({ userId: a.id, ...createSchema.parse(req.body), verificationStatus: 'pending' }).returning(); return row; }));
router.patch('/api/v1/seller-profiles/:id', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'seller' && a.role !== 'admin') throw new ApiError(403, 'Seller or administrator access required'); if (a.role !== 'admin' && a.id !== req.params.id) throw new ApiError(403, 'You can only edit your own storefront'); const [row] = await db.update(sellerProfiles).set({ ...updateSchema.parse(req.body), updatedAt: new Date() }).where(eq(sellerProfiles.userId, req.params.id)).returning(); if (!row) throw new ApiError(404, 'Seller profile not found'); return row; }));
router.delete('/api/v1/seller-profiles/:id', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'seller' && a.role !== 'admin') throw new ApiError(403, 'Seller or administrator access required'); if (a.role !== 'admin' && a.id !== req.params.id) throw new ApiError(403, 'You can only remove your own storefront'); const [row] = await db.update(sellerProfiles).set({ verificationStatus: 'rejected', updatedAt: new Date() }).where(eq(sellerProfiles.userId, req.params.id)).returning({ userId: sellerProfiles.userId }); if (!row) throw new ApiError(404, 'Seller profile not found'); return row; }));
export default router;
