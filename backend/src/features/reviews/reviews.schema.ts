import { z } from 'zod';
export const reviewSchema = z.object({ repairRequestId: z.string().uuid().optional(), partOrderId: z.string().uuid().optional(), subjectId: z.string().uuid(), rating: z.number().int().min(1).max(5), body: z.string().max(2000).optional() }).refine((v) => Boolean(v.repairRequestId) !== Boolean(v.partOrderId), 'Provide exactly one review context');
export const reviewUpdateSchema = z.object({ rating: z.number().int().min(1).max(5).optional(), body: z.string().max(2000).optional() }).refine((v) => Object.keys(v).length > 0, 'At least one field must be provided');
