import express, { type Request, type Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { platformUsers, technicianProfiles } from '../../db/schema';
import { requireDevelopmentActor } from '../../middleware/development-actor';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';

const profileSchema = z.object({ businessName: z.string().min(2).max(160), bio: z.string().max(5000).optional(), serviceArea: z.string().min(2).max(255), yearsExperience: z.number().int().min(0).max(100).optional(), offersMobileService: z.boolean().optional(), skills: z.array(z.string().min(1)).optional(), services: z.array(z.unknown()).optional(), availability: z.array(z.unknown()).optional(), portfolio: z.array(z.unknown()).optional() });
const updateSchema = profileSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');
const router = express.Router();
const actor = (req: Request) => { if (!req.devActor) throw new ApiError(401, 'Development actor is required'); return req.devActor; };
const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => { try { return sendSuccess(res, 200, 'OK', await fn(req)); } catch (error) { return sendError(res, error instanceof ApiError ? error.statusCode : 400, error instanceof Error ? error.message : 'Technician profile request failed'); } };

router.get('/api/v1/technician-profiles', handle(async () => db.select().from(technicianProfiles).where(eq(technicianProfiles.verificationStatus, 'verified')).orderBy(desc(technicianProfiles.createdAt))));
router.get('/api/v1/technician-profiles/:id', handle(async (req) => { const [row] = await db.select().from(technicianProfiles).where(and(eq(technicianProfiles.userId, req.params.id), eq(technicianProfiles.verificationStatus, 'verified'))); if (!row) throw new ApiError(404, 'Technician profile not found'); return row; }));
router.post('/api/v1/technician-profiles', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'technician') throw new ApiError(403, 'Only technicians can create technician profiles'); const input = profileSchema.parse(req.body); const [user] = await db.select({ id: platformUsers.id }).from(platformUsers).where(eq(platformUsers.id, a.id)); if (!user) throw new ApiError(404, 'Development actor does not exist in the database'); const [row] = await db.insert(technicianProfiles).values({ userId: a.id, ...input, verificationStatus: 'pending' }).returning(); return row; }));
router.patch('/api/v1/technician-profiles/:id', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'technician' && a.role !== 'admin') throw new ApiError(403, 'Technician or administrator access required'); if (a.role !== 'admin' && a.id !== req.params.id) throw new ApiError(403, 'You can only edit your own profile'); const [row] = await db.update(technicianProfiles).set({ ...updateSchema.parse(req.body), updatedAt: new Date() }).where(eq(technicianProfiles.userId, req.params.id)).returning(); if (!row) throw new ApiError(404, 'Technician profile not found'); return row; }));
router.delete('/api/v1/technician-profiles/:id', requireDevelopmentActor, handle(async (req) => { const a = actor(req); if (a.role !== 'admin' && a.id !== req.params.id) throw new ApiError(403, 'You can only remove your own profile'); const [row] = await db.delete(technicianProfiles).where(eq(technicianProfiles.userId, req.params.id)).returning({ userId: technicianProfiles.userId }); if (!row) throw new ApiError(404, 'Technician profile not found'); return row; }));
export default router;
