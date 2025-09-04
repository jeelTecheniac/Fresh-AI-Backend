import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { createSuccessResponse, createValidationError } from "../middleware/validation.js";

export interface PaginationInfo {
  page: number;
  limit: number;
  offset: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  validatedData?: any;
  pagination?: PaginationInfo;
}

export abstract class BaseController {
  protected logger = logger;

  /**
   * Send success response
   */
  protected sendSuccess(
    res: Response,
    data: any,
    message?: string,
    statusCode: number = 200,
    pagination?: any
  ): void {
    const response = createSuccessResponse(data, message, pagination);
    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string,
    code?: string,
    details?: any[]
  ): void {
    const response = createValidationError(message, code || "INTERNAL_ERROR", details);
    if (error) response.error = error;
    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  protected sendValidationError(
    res: Response,
    message: string,
    details?: any[],
    statusCode: number = 400
  ): void {
    this.sendError(res, message, statusCode, "VALIDATION_ERROR", "INVALID_DATA", details);
  }

  /**
   * Send not found error response
   */
  protected sendNotFound(
    res: Response,
    message: string = "Resource not found",
    statusCode: number = 404
  ): void {
    this.sendError(res, message, statusCode, "NOT_FOUND_ERROR", "RESOURCE_NOT_FOUND");
  }

  /**
   * Send unauthorized error response
   */
  protected sendUnauthorized(
    res: Response,
    message: string = "Unauthorized access",
    statusCode: number = 401
  ): void {
    this.sendError(res, message, statusCode, "AUTHENTICATION_ERROR", "UNAUTHORIZED");
  }

  /**
   * Send forbidden error response
   */
  protected sendForbidden(
    res: Response,
    message: string = "Access forbidden",
    statusCode: number = 403
  ): void {
    this.sendError(res, message, statusCode, "AUTHORIZATION_ERROR", "FORBIDDEN");
  }

  /**
   * Send conflict error response
   */
  protected sendConflict(
    res: Response,
    message: string = "Resource conflict",
    statusCode: number = 409
  ): void {
    this.sendError(res, message, statusCode, "CONFLICT_ERROR", "RESOURCE_CONFLICT");
  }

  /**
   * Get validated data from request
   */
  protected getValidatedData<T>(req: AuthenticatedRequest): T {
    return req.validatedData as T;
  }

  /**
   * Get pagination info from request
   */
  protected getPagination(req: AuthenticatedRequest): PaginationInfo | undefined {
    return req.pagination;
  }

  /**
   * Get authenticated user from request
   */
  protected getAuthenticatedUser(req: AuthenticatedRequest) {
    return req.user;
  }

  /**
   * Check if user is authenticated
   */
  protected isAuthenticated(req: AuthenticatedRequest): boolean {
    return !!req.user && !!req.user.userId;
  }

  /**
   * Get user ID from authenticated request
   */
  protected getUserId(req: AuthenticatedRequest): string | null {
    return req.user?.userId || null;
  }

  /**
   * Log request information
   */
  protected logRequest(req: AuthenticatedRequest, operation: string): void {
    this.logger.info(`Request: ${operation}`, {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId || "anonymous",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  }

  /**
   * Log error information
   */
  protected logError(error: any, operation: string, req?: AuthenticatedRequest): void {
    this.logger.error(`Error in ${operation}: ${error.message}`, {
      operation,
      error: error.stack,
      userId: req?.user?.userId || "anonymous",
      url: req?.originalUrl,
      method: req?.method,
    });
  }

  /**
   * Handle async operations with error handling
   */
  protected async handleAsync<T>(
    operation: () => Promise<T>,
    req: AuthenticatedRequest,
    res: Response,
    operationName: string
  ): Promise<void> {
    try {
      this.logRequest(req, operationName);
      const result = await operation();
      
      if (result === null || result === undefined) {
        this.sendNotFound(res, `${operationName} not found`);
        return;
      }

      this.sendSuccess(res, result, `${operationName} successful`);
    } catch (error) {
      this.logError(error, operationName, req);
      
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          this.sendNotFound(res, error.message);
        } else if (error.message.includes("unauthorized") || error.message.includes("Unauthorized")) {
          this.sendUnauthorized(res, error.message);
        } else if (error.message.includes("forbidden") || error.message.includes("Forbidden")) {
          this.sendForbidden(res, error.message);
        } else if (error.message.includes("conflict") || error.message.includes("already exists")) {
          this.sendConflict(res, error.message);
        } else {
          this.sendError(res, error.message);
        }
      } else {
        this.sendError(res, "An unexpected error occurred");
      }
    }
  }

  /**
   * Create pagination response
   */
  protected createPaginationResponse(
    data: any[],
    total: number,
    page: number,
    limit: number
  ) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(
    data: any,
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Sanitize data by removing sensitive fields
   */
  protected sanitizeData<T extends object>(data: T, sensitiveFields: string[] = ["password"]): Partial<T> {
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete (sanitized as any)[field];
      }
    }

    return sanitized;
  }
}
