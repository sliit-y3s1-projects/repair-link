import express, { type Request, type Response } from 'express';
import { requireDevelopmentActor } from '../../middleware/development-actor';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';
import { categorySchema, categoryUpdateSchema } from './categories.schema';
import { categoriesRepository } from './categories.repository';

const router = express.Router();
const admin = (req: Request) => { if (!req.devActor) throw new ApiError(401, 'Development actor is required'); if (req.devActor.role !== 'admin') throw new ApiError(403, 'Administrator access required'); return req.devActor; };
const handle = (fn: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => { try { return sendSuccess(res, 200, 'OK', await fn(req)); } catch (error) { return sendError(res, error instanceof ApiError ? error.statusCode : 400, error instanceof Error ? error.message : 'Category request failed'); } };

router.get('/api/v1/categories', handle(async () => categoriesRepository.list()));
router.post('/api/v1/categories', requireDevelopmentActor, handle(async (req) => { admin(req); return categoriesRepository.create(categorySchema.parse(req.body)); }));
router.get('/api/v1/categories/:id', handle(async (req) => { const row = await categoriesRepository.get(req.params.id); if (!row) throw new ApiError(404, 'Category not found'); return row; }));
router.patch('/api/v1/categories/:id', requireDevelopmentActor, handle(async (req) => { admin(req); const row = await categoriesRepository.update(req.params.id, categoryUpdateSchema.parse(req.body)); if (!row) throw new ApiError(404, 'Category not found'); return row; }));
router.delete('/api/v1/categories/:id', requireDevelopmentActor, handle(async (req) => { admin(req); const row = await categoriesRepository.remove(req.params.id); if (!row) throw new ApiError(404, 'Category not found'); return row; }));
export default router;
