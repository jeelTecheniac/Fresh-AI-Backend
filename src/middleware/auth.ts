import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/TokenService.js";
import { UserService } from "@/services/UserService.js";
import { logger } from "../utils/logger.js";
import { User } from "@/entities/User.js";
import { createUnauthorizedError } from "./errorHandler.js";

export type AuthRequest = Request & { user?: User };

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const tokenService = new TokenService();
    const userService = new UserService();

    try {
      const decoded = tokenService.verifyJWT(token);
      const user = await userService.getUserById(decoded.userId);
      if (!user) {
        throw createUnauthorizedError("User not found");
      }
      req.user = user;

      next();
    } catch (error) {
      logger.warn(`Invalid token attempt: ${error}`);
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const tokenService = new TokenService();

      try {
        const decoded = tokenService.verifyJWT(token);
        (req as any).user = decoded;
      } catch (error) {
        // Token is invalid, but we continue without user info
        logger.debug(`Optional auth failed: ${error}`);
      }
    }

    next();
  } catch (error) {
    logger.error(`Optional auth middleware error: ${error}`);
    next();
  }
};
