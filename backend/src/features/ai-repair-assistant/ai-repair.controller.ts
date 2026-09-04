import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';
import { aiRepairRequestSchema } from './ai-repair.schema';
import { aiRepairService } from './ai-repair.service';

export const askAiRepairAssistantController = async (req: Request, res: Response) => {
  try {
    const input = aiRepairRequestSchema.parse(req.body);
    const result = await aiRepairService.answer(input);
    return sendSuccess(res, 200, 'Repair guidance generated successfully', result);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(res, 400, 'Invalid repair question', error.issues.map((issue) => issue.message));
    }
    if (error instanceof ApiError) {
      return sendError(res, error.statusCode, error.message, error.errors);
    }

    console.error('Unexpected AI assistant error', error);
    return sendError(res, 500, 'Unexpected server error');
  }
};
