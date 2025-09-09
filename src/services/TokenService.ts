import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import {
  createBadRequestError,
  createUnauthorizedError,
} from "../errors/index.js";

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
  userName: string;
  role: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  /**
   * Generate access token (24 hours)
   */
  generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createBadRequestError("JWT_SECRET environment variable is not set");
    }

    const signOptions: SignOptions = { expiresIn: 60 * 60 * 24 }; // 24 hours

    try {
      return jwt.sign(payload, secret as Secret, signOptions);
    } catch (error) {
      logger.error(`Access token generation error: ${error}`);
      throw createBadRequestError("Failed to generate access token");
    }
  }

  /**
   * Generate refresh token (3 months)
   */
  generateRefreshToken(payload: TokenPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw createBadRequestError("JWT_SECRET environment variable is not set");
    }

    const signOptions: SignOptions = { expiresIn: 60 * 60 * 24 * 90 }; // 3 months (90 days)

    try {
      return jwt.sign(payload, secret as Secret, signOptions);
    } catch (error) {
      logger.error(`Refresh token generation error: ${error}`);
      throw createBadRequestError("Failed to generate refresh token");
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Generate password reset token (1 hour)
   */
  generatePasswordResetToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createBadRequestError("JWT_SECRET environment variable is not set");
    }

    const signOptions: SignOptions = { expiresIn: 60 * 60 }; // 1 hour

    try {
      return jwt.sign(payload, secret as Secret, signOptions);
    } catch (error) {
      logger.error(`Password reset token generation error: ${error}`);
      throw createBadRequestError("Failed to generate password reset token");
    }
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw createBadRequestError(
          "JWT_SECRET environment variable is not set"
        );
      }

      return jwt.verify(token, secret as Secret);
    } catch (error) {
      logger.error(`Password reset token verification error: ${error}`);
      throw createUnauthorizedError("Invalid or expired password reset token");
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw createBadRequestError(
          "JWT_SECRET environment variable is not set"
        );
      }

      return jwt.verify(token, secret as Secret);
    } catch (error) {
      logger.error(`Access token verification error: ${error}`);
      throw createUnauthorizedError("Invalid access token");
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): any {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      if (!secret) {
        throw createBadRequestError(
          "JWT_SECRET environment variable is not set"
        );
      }

      return jwt.verify(token, secret as Secret);
    } catch (error) {
      logger.error(`Refresh token verification error: ${error}`);
      throw createUnauthorizedError("Invalid refresh token");
    }
  }

  /**
   * Verify JWT token (backward compatibility - defaults to access token)
   */
  verifyJWT(token: string): any {
    return this.verifyAccessToken(token);
  }

  /**
   * Generate token payload from user object
   */
  createTokenPayload(user: any): TokenPayload {
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      userName: user.userName,
      role: user.role?.name || null,
    };
  }
}
