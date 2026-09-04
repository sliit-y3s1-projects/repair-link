import express, { type Request, type Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { reports } from '../../db/schema';
import { requireDevelopmentActor } from '../../middleware/development-actor';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';

const createSchema = z.object({ targetType: z.enum(['user', 'review', 'listing', 'repair', 'order']), targetId: z.string().uuid(), reason: z.string().min(5).max(2000) });
const updateSchema = z.object({ status: z.enum(['open', 'reviewing', 'resolved', 'dismissed']), resolutionNote: z.string().max(2000).optional() });
const router = express.Router();
const actor = (req: Request) => { if (!req.devActor) throw new ApiError(401, 'Development actor is required'); return req.devActor; };
const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => { try { return sendSuccess(res, 200, 'OK', await fn(req)); } catch (e) { return sendError(res, e instanceof ApiError ? e.statusCode : 400, e instanceof Error ? e.message : 'Moderation request failed'); } };

router.post('/api/v1/reports', requireDevelopmentActor, handle(async (req) => { const a = actor(req); const [row] = await db.insert(reports).values({ ...createSchema.parse(req.body), reporterId: a.id }).returning(); return row; }));
router.get('/api/v1/admin/reports', requireDevelopmentActor, handle(async (req) => { if (actor(req).role !== 'admin') throw new ApiError(403, 'Administrator access required'); const status = typeof req.query.status === 'string' ? req.query.status : undefined; return db.select().from(reports).where(status ? eq(reports.status, status as 'open') : undefined).orderBy(desc(reports.createdAt)); }));
router.patch('/api/v1/admin/reports/:id', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'admin') throw new ApiError(403, 'Administrator access required'); const input = updateSchema.parse(req.body); const [row] = await db.update(reports).set({ ...input, resolvedById: ['resolved', 'dismissed'].includes(input.status) ? a.id : undefined, resolvedAt: ['resolved', 'dismissed'].includes(input.status) ? new Date() : undefined, updatedAt: new Date() }).where(and(eq(reports.id, req.params.id))).returning(); if (!row) throw new ApiError(404, 'Report not found'); return row; }));
export default router;
