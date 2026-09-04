import { Request, Response } from 'express';
import { z } from 'zod';
import {
  CreateOrderSchema,
  CreatePartListingSchema,
  SearchPartsQuerySchema,
  UpdatePartListingSchema,
  OrderStatusEnum,
} from './parts.schema';
import { partsService } from './parts.service';
import { ApiError, sendError, sendSuccess } from '../../shared/api-response';

const getValidationErrors = (error: z.ZodError) =>
  error.issues.map((issue) => issue.message);

const actorFor = (req: Request) => {
  if (!req.devActor) throw new ApiError(401, 'Development actor is required');
  return req.devActor;
};

export const searchPartsController = async (req: Request, res: Response) => {
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

    const results = await partsService.searchParts(parseResult.data);
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

export const getPartByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const part = await partsService.getPartById(id);
    return sendSuccess(res, 200, 'Spare part details retrieved successfully', part);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while fetching part details');
  }
};

export const createPartListingController = async (req: Request, res: Response) => {
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

    const actor = actorFor(req);
    const created = await partsService.createListing(parseResult.data, actor);
    return sendSuccess(res, 201, 'Spare part listing published successfully', created);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while creating listing');
  }
};

export const updatePartListingController = async (req: Request, res: Response) => {
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

    const actor = actorFor(req);
    const updated = await partsService.updateListing(id, parseResult.data, actor);
    return sendSuccess(res, 200, 'Spare part listing updated successfully', updated);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while updating listing');
  }
};

export const deletePartListingController = async (req: Request, res: Response) => {
  try { return sendSuccess(res, 200, 'Spare part listing archived successfully', await partsService.removeListing(req.params.id, actorFor(req))); }
  catch (err: unknown) { if (err instanceof ApiError) return sendError(res, err.statusCode, err.message, err.errors); return sendError(res, 500, 'Internal server error while archiving listing'); }
};

export const createOrderController = async (req: Request, res: Response) => {
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

    const buyer = actorFor(req);
    const order = await partsService.createOrder(parseResult.data, buyer);
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

export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const actor = actorFor(req);
    const order = await partsService.getOrderById(orderId, actor);
    return sendSuccess(res, 200, 'Order details retrieved successfully', order);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return sendError(res, err.statusCode, err.message, err.errors);
    }
    return sendError(res, 500, 'Internal server error while fetching order');
  }
};

export const getMyOrdersController = async (req: Request, res: Response) => {
  try {
    const actor = actorFor(req);
    const orders = await partsService.getMyOrders(actor);
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

export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    const actor = actorFor(req);
    const parsed = OrderStatusEnum.safeParse((req.body as Record<string, unknown>).status);
    if (!parsed.success) return sendError(res, 400, 'Invalid order status');
    return sendSuccess(res, 200, 'Order status updated successfully', await partsService.updateOrderStatus(req.params.orderId, parsed.data, actor));
  } catch (err: unknown) {
    if (err instanceof ApiError) return sendError(res, err.statusCode, err.message, err.errors);
    return sendError(res, 500, 'Internal server error while updating order');
  }
};
