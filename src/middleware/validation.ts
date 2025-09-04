import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { logger } from "../utils/logger.js";

export interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  value?: any;
}

/**
 * Generic validation function using Joi
 */
export function validateSchema(
  schema: Joi.Schema,
  data: any,
  options: ValidationOptions = {}
): ValidationResult {
  const defaultOptions: ValidationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    ...options,
  };

  try {
    const { error, value } = schema.validate(data, defaultOptions);

    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      value,
    };
  } catch (err) {
    logger.error(`Validation error: ${err}`);
    return {
      isValid: false,
      errors: [
        {
          field: "unknown",
          message: "Validation failed due to internal error",
        },
      ],
    };
  }
}

/**
 * Middleware factory for validating request data
 */
export function validateRequest(
  schema: Joi.Schema,
  location: "body" | "query" | "params" | "headers" = "body",
  options: ValidationOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[location];

    if (!data) {
      res.status(400).json({
        success: false,
        message: `Missing ${location} data`,
        error: "VALIDATION_ERROR",
        code: "MISSING_DATA",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const validation = validateSchema(schema, data, options);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "VALIDATION_ERROR",
        code: "INVALID_DATA",
        details: validation.errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach validated data to request for use in controllers
    (req as any).validatedData = validation.value;

    // Log validation success for debugging
    logger.debug(`Validation passed for ${location}`, {
      endpoint: req.originalUrl,
      method: req.method,
      dataKeys: Object.keys(validation.value || {}),
    });

    next();
  };
}

/**
 * Middleware for validating multiple request parts
 */
export function validateMultiple(
  validations: Array<{
    schema: Joi.Schema;
    location: "body" | "query" | "params" | "headers";
    options?: ValidationOptions;
  }>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const allErrors: ValidationError[] = [];
    let hasErrors = false;

    for (const validation of validations) {
      const data = req[validation.location];

      if (data) {
        const result = validateSchema(
          validation.schema,
          data,
          validation.options
        );

        if (!result.isValid && result.errors) {
          allErrors.push(...result.errors);
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "VALIDATION_ERROR",
        code: "INVALID_DATA",
        details: allErrors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware for validating authentication headers
 */
export function validateAuthHeaders() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authorization header is required",
        error: "AUTHENTICATION_ERROR",
        code: "MISSING_AUTH_HEADER",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization header must start with 'Bearer '",
        error: "AUTHENTICATION_ERROR",
        code: "INVALID_AUTH_FORMAT",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!token || token.trim().length === 0) {
      res.status(401).json({
        success: false,
        message: "Token is required",
        error: "AUTHENTICATION_ERROR",
        code: "MISSING_TOKEN",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Middleware for validating pagination parameters
 */
export function validatePagination() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { page, limit } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    if (pageNum < 1) {
      res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
        error: "VALIDATION_ERROR",
        code: "INVALID_PAGE",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
        error: "VALIDATION_ERROR",
        code: "INVALID_LIMIT",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach validated pagination to request
    (req as any).pagination = {
      page: pageNum,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    };

    next();
  };
}

/**
 * Utility function to create standardized error responses
 */
export function createValidationError(
  message: string,
  code: string,
  details?: ValidationError[]
) {
  return {
    success: false,
    message,
    error: "VALIDATION_ERROR",
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Utility function to create standardized success responses
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  pagination?: any
) {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}
