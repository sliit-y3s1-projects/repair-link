import type { NextFunction, Request, Response } from 'express';
import { ApiError, sendError } from '../features/technician-profile/shared/api-response';

export const notFoundHandler = (req: Request, res: Response) =>
  sendError(res, 404, 'Route not found', [`${req.method} ${req.originalUrl}`]);

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof ApiError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }

  console.error('Unhandled request error', error);
  sendError(res, 500, 'Internal server error');
};
