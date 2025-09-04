import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// Using the AppError class defined below as the error shape

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error("Global error handler caught:", {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Default error values
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code || "INTERNAL_ERROR";

  // Handle specific error types
  if (error.name === "ValidationError") {
    res
      .status(400)
      .json(createValidationError("Validation failed", error.details));
    return;
  }

  if (
    error.name === "UnauthorizedError" ||
    error.name === "JsonWebTokenError"
  ) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: "AUTHENTICATION_ERROR",
      code: "INVALID_TOKEN",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token has expired",
      error: "AUTHENTICATION_ERROR",
      code: "TOKEN_EXPIRED",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
      error: "VALIDATION_ERROR",
      code: "INVALID_ID_FORMAT",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error.name === "MongoError" || error.name === "MongoServerError") {
    // Handle MongoDB specific errors
    if ((error as any).code === 11000) {
      res.status(409).json({
        success: false,
        message: "Duplicate key error",
        error: "CONFLICT_ERROR",
        code: "DUPLICATE_KEY",
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // Handle TypeORM errors
  if (error.name === "QueryFailedError") {
    res.status(400).json({
      success: false,
      message: "Database query failed",
      error: "DATABASE_ERROR",
      code: "QUERY_FAILED",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error.name === "EntityNotFoundError") {
    res.status(404).json({
      success: false,
      message: "Resource not found",
      error: "NOT_FOUND_ERROR",
      code: "RESOURCE_NOT_FOUND",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle rate limiting errors
  if (error.message && error.message.includes("Too many requests")) {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      error: "RATE_LIMIT_ERROR",
      code: "TOO_MANY_REQUESTS",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Generic error response
  const errorResponse = {
    success: false,
    message:
      process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
    error: "INTERNAL_ERROR",
    code,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "NOT_FOUND_ERROR",
    code: "ROUTE_NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any[];

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
    this.name = "AppError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Utility functions to create specific error types
 */
export function createNotFoundError(
  message: string = "Resource not found"
): AppError {
  return new AppError(message, 404, "RESOURCE_NOT_FOUND");
}

export function createUnauthorizedError(
  message: string = "Unauthorized access"
): AppError {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function createForbiddenError(
  message: string = "Access forbidden"
): AppError {
  return new AppError(message, 403, "FORBIDDEN");
}

export function createConflictError(
  message: string = "Resource conflict"
): AppError {
  return new AppError(message, 409, "RESOURCE_CONFLICT");
}

export function createValidationError(
  message: string = "Validation failed",
  details: any[] = []
): AppError {
  return new AppError(message, 400, "VALIDATION_ERROR", details);
}

export function createBadRequestError(
  message: string = "Bad request"
): AppError {
  return new AppError(message, 400, "BAD_REQUEST");
}
