import { Response } from 'express';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: string[];

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, ApiError);
  }
}

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data: unknown,
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: string[] = [],
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
