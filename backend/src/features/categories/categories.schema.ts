import { z } from 'zod';

export const categorySchema = z.object({ name: z.string().min(2).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), isActive: z.boolean().optional() });
export const categoryUpdateSchema = categorySchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');
export type CategoryInput = z.infer<typeof categorySchema>;
