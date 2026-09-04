import { z } from 'zod';

export const aiRepairRequestSchema = z.object({
  question: z.string().trim().min(5, 'Please describe the repair problem').max(2000, 'Question is too long'),
});

export const aiRepairAssessmentSchema = z.object({
  answer: z.string().min(1).max(3000),
  issueCategory: z.string().min(1).max(100),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  recommendedSkills: z.array(z.string().min(1).max(100)).max(8),
  safetyWarning: z.string().max(500).nullable(),
  followUpQuestions: z.array(z.string().min(1).max(300)).max(4),
});

export type AiRepairRequest = z.infer<typeof aiRepairRequestSchema>;
