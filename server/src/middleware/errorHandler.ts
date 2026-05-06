import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: number; keyValue?: Record<string, unknown> },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists.`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json(response);
};
