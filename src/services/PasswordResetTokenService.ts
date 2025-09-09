import { User } from "../entities/User.js";
import { TokenService } from "./TokenService.js";
import { TokenRepository } from "../repositories/TokenRepository.js";
import { logger } from "../utils/logger.js";

export class PasswordResetTokenService {
  private tokenService: TokenService;
  private tokenRepository: TokenRepository;

  constructor() {
    this.tokenService = new TokenService();
    this.tokenRepository = new TokenRepository();
  }

  /**
   * Generate and store password reset token for user
   */
  async generateAndStoreResetToken(user: User): Promise<string> {
    try {
      // Generate password reset token
      const tokenPayload = this.tokenService.createTokenPayload(user);
      const resetToken =
        this.tokenService.generatePasswordResetToken(tokenPayload);

      // Store reset token in database (expires in 1 hour)
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

      await this.tokenRepository.storePasswordResetToken(
        user,
        resetToken,
        resetTokenExpiry
      );

      logger.info(
        `Password reset token generated and stored for user: ${user.email}`
      );
      return resetToken;
    } catch (error) {
      logger.error(`Password reset token generation error: ${error}`);
      throw error;
    }
  }

  /**
   * Generate password reset token only
   */
  async generateResetToken(user: User): Promise<string> {
    try {
      const tokenPayload = this.tokenService.createTokenPayload(user);
      const resetToken =
        this.tokenService.generatePasswordResetToken(tokenPayload);

      logger.info(`Password reset token generated for user: ${user.email}`);
      return resetToken;
    } catch (error) {
      logger.error(`Password reset token generation error: ${error}`);
      throw error;
    }
  }

  /**
   * Store password reset token in database
   */
  async storeResetToken(
    user: User,
    resetToken: string,
    expiresAt: Date
  ): Promise<void> {
    try {
      await this.tokenRepository.storePasswordResetToken(
        user,
        resetToken,
        expiresAt
      );
      logger.info(`Password reset token stored for user: ${user.email}`);
    } catch (error) {
      logger.error(`Password reset token storage error: ${error}`);
      throw error;
    }
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(token: string): Promise<any> {
    try {
      return this.tokenService.verifyPasswordResetToken(token);
    } catch (error) {
      logger.error(`Password reset token verification error: ${error}`);
      throw error;
    }
  }

  /**
   * Check if password reset token is valid in database
   */
  async isResetTokenValid(token: string): Promise<boolean> {
    try {
      return await this.tokenRepository.isPasswordResetTokenValid(token);
    } catch (error) {
      logger.error(`Password reset token validation error: ${error}`);
      throw error;
    }
  }

  /**
   * Invalidate password reset token
   */
  async invalidateResetToken(token: string): Promise<boolean> {
    try {
      const result =
        await this.tokenRepository.invalidatePasswordResetToken(token);
      logger.info(`Password reset token invalidated: ${token}`);
      return result;
    } catch (error) {
      logger.error(`Password reset token invalidation error: ${error}`);
      throw error;
    }
  }
}
