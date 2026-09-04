import { Request, Response } from 'express';
import { z } from 'zod';
import {
  BookRepairRequestSchema,
  CancelRepairRequestSchema,
  CreateRepairRequestSchema,
  OpenDisputeSchema,
  PresignPhotoUploadSchema,
  SearchRepairRequestsSchema,
  SubmitQuoteSchema,
  TechnicianLeadsQuerySchema,
  UpdateRepairStatusSchema,
} from './repair-requests.schema';
import { repairRequestsService } from './repair-requests.service';
import { DevActor } from './repair-requests.types';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';

const getValidationErrors = (error: z.ZodError) =>
  error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

// Extract development actor per GUIDE.md specifications
export const extractDevActor = (req: Request): DevActor => {
  const actorRoleHeader = req.headers['x-actor-role'] as string;
  const actorIdHeader = req.headers['x-actor-id'] as string;
  const actorNameHeader = req.headers['x-actor-name'] as string;
  const serviceAreaHeader = req.headers['x-actor-service-area'] as string;
  const categoriesHeader = req.headers['x-actor-categories'] as string;

  const validRoles = ['consumer', 'technician', 'seller', 'admin'] as const;
  const role = validRoles.find((r) => r === actorRoleHeader) || 'consumer';

  let supportedCategories: string[] | undefined;
  if (categoriesHeader) {
    supportedCategories = categoriesHeader.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return {
    id: actorIdHeader || (role === 'technician' ? 'tech_kandy_01' : 'consumer_colombo_01'),
    name: actorNameHeader || (role === 'technician' ? 'Chaminda Silva' : 'Kavinda Perera'),
    role,
    serviceArea: serviceAreaHeader || (role === 'technician' ? 'Kandy' : undefined),
    supportedCategories: supportedCategories || (role === 'technician' ? ['Smartphones', 'Laptops'] : undefined),
  };
};

export const presignPhotoUploadController = (req: Request, res: Response) => {
  try {
    const parseResult = PresignPhotoUploadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Invalid photo metadata for pre-signing',
        getValidationErrors(parseResult.error),
      );
    }

    const presignedData = repairRequestsService.presignPhotoUpload(parseResult.data);
    return sendSuccess(res, 200, 'Pre-signed photo upload URL generated successfully', presignedData);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while generating upload URL');
  }
};

export const createRepairRequestController = (req: Request, res: Response) => {
  try {
    const parseResult = CreateRepairRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for repair request',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const created = repairRequestsService.createRequest(parseResult.data, actor);
    return sendSuccess(res, 201, 'Repair request created successfully', created);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while creating repair request');
  }
};

export const getRepairRequestByIdController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actor = extractDevActor(req);
    const request = repairRequestsService.getRequestById(id, actor);
    return sendSuccess(res, 200, 'Repair request details retrieved successfully', request);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while retrieving repair request');
  }
};

export const listRepairRequestsController = (req: Request, res: Response) => {
  try {
    const parseResult = SearchRepairRequestsSchema.safeParse(req.query);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Invalid query parameters for repair requests search',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const requests = repairRequestsService.listRequests(parseResult.data, actor);
    return sendSuccess(res, 200, 'Repair requests retrieved successfully', {
      total: requests.length,
      requests,
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while listing repair requests');
  }
};

export const getTechnicianLeadsController = (req: Request, res: Response) => {
  try {
    const parseResult = TechnicianLeadsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Invalid leads filter parameters',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const leads = repairRequestsService.getLeadsForTechnician(
      actor,
      parseResult.data.category,
      parseResult.data.location,
    );

    return sendSuccess(
      res,
      200,
      'Eligible repair leads retrieved based on active technician profile categories and service area',
      {
        technicianId: actor.id,
        serviceArea: actor.serviceArea,
        categories: actor.supportedCategories,
        totalLeads: leads.length,
        leads,
      },
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while retrieving technician leads');
  }
};

export const submitQuoteController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = SubmitQuoteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for quotation',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const result = repairRequestsService.submitQuote(id, parseResult.data, actor);
    return sendSuccess(
      res,
      201,
      'Quote submitted successfully and request status moved to quoted',
      result,
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while submitting quote');
  }
};

export const bookRepairRequestController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = BookRepairRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for booking',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const booked = repairRequestsService.bookRepairRequest(id, parseResult.data, actor);
    return sendSuccess(
      res,
      200,
      'Quote accepted and repair request booked successfully',
      booked,
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while booking repair request');
  }
};

export const updateRepairStatusController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = UpdateRepairStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for status update',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const updated = repairRequestsService.updateWorkStatus(id, parseResult.data, actor);
    return sendSuccess(
      res,
      200,
      `Status transitioned to ${parseResult.data.status} with immutable history record created`,
      updated,
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while updating repair status');
  }
};

export const cancelRepairRequestController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = CancelRepairRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for cancellation',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const cancelled = repairRequestsService.cancelRequest(id, parseResult.data, actor);
    return sendSuccess(
      res,
      200,
      'Repair request cancelled successfully and immutable history logged',
      cancelled,
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while cancelling repair request');
  }
};

export const openDisputeController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = OpenDisputeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for dispute opening',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const disputed = repairRequestsService.openDispute(id, parseResult.data, actor);
    return sendSuccess(
      res,
      200,
      'Dispute opened successfully and recorded in status history',
      disputed,
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while opening dispute');
  }
};

export const getRepairStatusHistoryController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actor = extractDevActor(req);
    const history = repairRequestsService.getStatusHistory(id, actor);
    return sendSuccess(
      res,
      200,
      'Immutable repair status history retrieved successfully',
      {
        repairRequestId: id,
        totalTransitions: history.length,
        history,
      },
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while retrieving status history');
  }
};

