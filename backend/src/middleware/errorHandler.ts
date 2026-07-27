import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.message.includes('Email already registered') || err.message.includes('Phone number already registered')) {
    res.status(409).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err.message.includes('Invalid email/number or password')) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // MongoDB duplicate key error
  if (err.name === 'MongoServerError' && 'code' in err && err.code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
    return;
  }

  // Default error response
  res.status(status).json({
    success: false,
    message,
  });
};

export default errorHandler;
