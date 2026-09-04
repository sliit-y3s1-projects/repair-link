import { Request, Response } from 'express';
import { z } from 'zod';
import {
  CreateOrderSchema,
  CreatePartListingSchema,
  SearchPartsQuerySchema,
  UpdatePartListingSchema,
} from './parts.schema';
import { DevActor, partsService } from './parts.service';
import { ApiError, sendError, sendSuccess } from '../technician-profile/shared/api-response';

const getValidationErrors = (error: z.ZodError) =>
  error.issues.map((issue) => issue.message);

// Helper to extract development actor per GUIDE.md
export const extractDevActor = (req: Request): DevActor => {
  const actorHeader = req.headers['x-actor-role'] as string;
  const actorIdHeader = req.headers['x-actor-id'] as string;
  const actorNameHeader = req.headers['x-actor-name'] as string;
  const storeNameHeader = req.headers['x-store-name'] as string;

  const validRoles = ['consumer', 'technician', 'seller', 'admin'] as const;
  const role = validRoles.find((r) => r === actorHeader) || 'consumer';

  return {
    id: actorIdHeader || (role === 'seller' ? 'seller_colombo_01' : 'consumer_kandy_01'),
    name: actorNameHeader || (role === 'seller' ? 'Ruwan Perera' : 'Nimal Fernando'),
    role,
    storeName: storeNameHeader || (role === 'seller' ? 'Pettah Tech Spares Hub' : undefined),
  };
};

export const searchPartsController = (req: Request, res: Response) => {
  try {
    const parseResult = SearchPartsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Invalid search query parameters',
        getValidationErrors(parseResult.error),
      );
    }

    const results = partsService.searchParts(parseResult.data);
    return sendSuccess(res, 200, 'Spare parts retrieved successfully', {
      total: results.length,
      parts: results,
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while searching spare parts');
  }
};

export const getPartByIdController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const part = partsService.getPartById(id);
    return sendSuccess(res, 200, 'Spare part details retrieved successfully', part);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while fetching part details');
  }
};

export const createPartListingController = (req: Request, res: Response) => {
  try {
    const parseResult = CreatePartListingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for spare part listing',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const created = partsService.createListing(parseResult.data, actor);
    return sendSuccess(res, 201, 'Spare part listing published successfully', created);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while creating listing');
  }
};

export const updatePartListingController = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = UpdatePartListingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for update data',
        getValidationErrors(parseResult.error),
      );
    }

    const actor = extractDevActor(req);
    const updated = partsService.updateListing(id, parseResult.data, actor);
    return sendSuccess(res, 200, 'Spare part listing updated successfully', updated);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while updating listing');
  }
};

export const createOrderController = (req: Request, res: Response) => {
  try {
    const parseResult = CreateOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        400,
        'Validation failed for order request',
        getValidationErrors(parseResult.error),
      );
    }

    const buyer = extractDevActor(req);
    const order = partsService.createOrder(parseResult.data, buyer);
    return sendSuccess(
      res,
      201,
      'Order placed successfully and inventory updated transactionally',
      order,
    );
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while placing order');
  }
};

export const getOrderByIdController = (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const actor = extractDevActor(req);
    const order = partsService.getOrderById(orderId, actor);
    return sendSuccess(res, 200, 'Order details retrieved successfully', order);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while fetching order');
  }
};

export const getMyOrdersController = (req: Request, res: Response) => {
  try {
    const actor = extractDevActor(req);
    const orders = partsService.getMyOrders(actor);
    return sendSuccess(res, 200, 'Orders retrieved successfully', {
      role: actor.role,
      count: orders.length,
      orders,
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while fetching orders');
  }
};
