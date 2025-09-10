import { TokenRepository } from "../repositories/TokenRepository.js";
import { logger } from "../utils/logger.js";

export class TokenDatabaseService {
  private tokenRepository: TokenRepository;

  constructor() {
    this.tokenRepository = new TokenRepository();
  }

  /**
   * Find and verify password reset token in database
   */
  async findAndVerifyPasswordResetToken(jti: string, userId: string) {
    try {
      const tokenRecord =
        await this.tokenRepository.findAndVerifyPasswordResetToken(jti, userId);

      if (!tokenRecord) {
        throw new Error("Invalid or expired token");
      }

      // Check if token is already verified
      if (tokenRecord.verified_at) {
        throw new Error("Token has already been verified");
      }

      logger.info(
        `Token found and verified in database for user: ${tokenRecord.user.email}`
      );

      return tokenRecord;
    } catch (error) {
      logger.error(`Token database verification error: ${error}`);
      throw error;
    }
  }

  async findPasswordResetToken(jti: string) {
    try {
      const tokenRecord =
        await this.tokenRepository.findPasswordResetToken(jti);

      if (!tokenRecord) {
        throw new Error("Token not found");
      }

      logger.info(
        `Token found in database for user: ${tokenRecord.user.email}`
      );

      return tokenRecord;
    } catch (error) {
      logger.error(`Token database lookup error: ${error}`);
      throw error;
    }
  }

  /**
   * Update token record in database
   */
  async updateToken(
    tokenId: string,
    updateData: { verified_at?: Date | null }
  ): Promise<boolean> {
    try {
      const result = await this.tokenRepository.updateToken(
        tokenId,
        updateData
      );

      if (result) {
        logger.info(`Token updated successfully: ${tokenId}`);
        return true;
      } else {
        logger.warn(`Failed to update token: ${tokenId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Token update error: ${error}`);
      throw error;
    }
  }
}
