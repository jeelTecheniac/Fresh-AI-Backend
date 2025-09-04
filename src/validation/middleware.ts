import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { logger } from "../utils/logger.js";

export interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  errors?: ValidationErrorItem[];
  value?: T;
}

export function validateSchema<T = any>(
  schema: Joi.Schema,
  data: any,
  options: ValidationOptions = {}
): ValidationResult<T> {
  const defaultOptions: ValidationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    ...options,
  };

  try {
    const { error, value } = schema.validate(data, defaultOptions);
    if (error) {
      const errors: ValidationErrorItem[] = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));
      return { isValid: false, errors };
    }
    return { isValid: true, value };
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

    (req as any).validatedData = validation.value;
    logger.debug(`Validation passed for ${location}`, {
      endpoint: req.originalUrl,
      method: req.method,
      dataKeys: Object.keys(validation.value || {}),
    });
    next();
  };
}

export function validateMultiple(
  validations: Array<{
    schema: Joi.Schema;
    location: "body" | "query" | "params" | "headers";
    options?: ValidationOptions;
  }>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const allErrors: ValidationErrorItem[] = [];
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
    (req as any).pagination = {
      page: pageNum,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    };
    next();
  };
}
