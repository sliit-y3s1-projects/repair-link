import { z } from 'zod';

export const repairStatusValues = ['requested', 'quoted', 'booked', 'in_progress', 'waiting_for_parts', 'completed', 'cancelled', 'disputed'] as const;
export const createRepairRequestSchema = z.object({
  categoryId: z.string().uuid(), deviceBrand: z.string().max(120).optional(), deviceModel: z.string().max(160).optional(),
  issueDescription: z.string().min(10).max(5000), preferredMethod: z.enum(['on_site', 'pickup_dropoff', 'shop_visit']),
  locationText: z.string().min(2).max(255), preferredAt: z.coerce.date().optional(), budgetAmount: z.number().positive().optional(),
});
export const createQuoteSchema = z.object({ amount: z.number().positive(), message: z.string().max(5000).optional(), estimatedDurationHours: z.number().int().positive().optional(), expiresAt: z.coerce.date().optional() });
export const updateRepairRequestSchema = z.object({ issueDescription: z.string().min(10).max(5000).optional(), locationText: z.string().min(2).max(255).optional(), preferredAt: z.coerce.date().optional(), budgetAmount: z.number().positive().optional() }).refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');
export const statusSchema = z.object({ status: z.enum(repairStatusValues), note: z.string().max(2000).optional() });
export type CreateRepairRequest = z.infer<typeof createRepairRequestSchema>;
export type CreateQuote = z.infer<typeof createQuoteSchema>;
export type UpdateRepairRequest = z.infer<typeof updateRepairRequestSchema>;
