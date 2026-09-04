import express, { type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { sellerProfiles, technicianProfiles } from '../../db/schema';
import { requireDevelopmentActor } from '../../middleware/development-actor';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';

const statusSchema = z.object({ status: z.enum(['draft', 'pending', 'verified', 'rejected']) });
const router = express.Router();
const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => { try { return sendSuccess(res, 200, 'OK', await fn(req)); } catch (error) { return sendError(res, error instanceof ApiError ? error.statusCode : 400, error instanceof Error ? error.message : 'Admin request failed'); } };
const admin = (req: Request) => { if (!req.devActor) throw new ApiError(401, 'Development actor is required'); if (req.devActor.role !== 'admin') throw new ApiError(403, 'Administrator access required'); };

router.patch('/api/v1/admin/technicians/:id/verification', requireDevelopmentActor, handle(async (req) => { admin(req); const [row] = await db.update(technicianProfiles).set({ verificationStatus: statusSchema.parse(req.body).status, updatedAt: new Date() }).where(eq(technicianProfiles.userId, req.params.id)).returning(); if (!row) throw new ApiError(404, 'Technician profile not found'); return row; }));
router.patch('/api/v1/admin/sellers/:id/verification', requireDevelopmentActor, handle(async (req) => { admin(req); const [row] = await db.update(sellerProfiles).set({ verificationStatus: statusSchema.parse(req.body).status, updatedAt: new Date() }).where(eq(sellerProfiles.userId, req.params.id)).returning(); if (!row) throw new ApiError(404, 'Seller profile not found'); return row; }));
export default router;
