import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source.js";
import { Token } from "../entities/Token.js";
import { User } from "../entities/User.js";
import { tokenType } from "@/utils/tokenType.js";

export class TokenRepository {
  private repository: Repository<Token>;

  constructor() {
    this.repository = AppDataSource.getRepository(Token);
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(
    user: User,
    refreshToken: string,
    expiresAt: Date
  ): Promise<Token> {
    // First, invalidate any existing refresh tokens for this user
    await this.invalidateUserRefreshTokens(user.id);

    const token = this.repository.create({
      token: refreshToken,
      token_type: tokenType.REFRESH,
      token_expire: expiresAt,
      user: user,
    });

    return this.repository.save(token);
  }

  /**
   * Find refresh token by token string
   */
  async findRefreshToken(token: string): Promise<Token | null> {
    return this.repository.findOne({
      where: {
        token: token,
        token_type: tokenType.REFRESH,
      },
      relations: ["user", "user.role"],
    });
  }

  /**
   * Invalidate a specific refresh token
   */
  async invalidateRefreshToken(token: string): Promise<boolean> {
    const result = await this.repository.delete({
      token: token,
      token_type: tokenType.REFRESH,
    });
    return result.affected !== 0;
  }

  /**
   * Invalidate all refresh tokens for a user
   */
  async invalidateUserRefreshTokens(userId: string): Promise<boolean> {
    const result = await this.repository.delete({
      user: { id: userId },
      token_type: tokenType.REFRESH,
    });
    return result.affected !== 0;
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where("token_expire < :now", { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  /**
   * Check if refresh token exists and is valid
   */
  async isRefreshTokenValid(token: string): Promise<boolean> {
    const tokenRecord = await this.repository.findOne({
      where: {
        token: token,
        token_type: tokenType.REFRESH,
      },
    });

    if (!tokenRecord) {
      return false;
    }

    // Check if token is expired
    return tokenRecord.token_expire > new Date();
  }

  /**
   * Store or update password reset token in database
   */
  async storePasswordResetToken(
    user: User,
    resetToken: string,
    expiresAt: Date
  ): Promise<Token> {
    // Check if user already has a password reset token
    const existingToken = await this.repository.findOne({
      where: {
        user: { id: user.id },
        token_type: tokenType.RESET_PASSWORD,
      },
    });

    if (existingToken) {
      // Update existing token
      existingToken.token = resetToken;
      existingToken.token_expire = expiresAt;
      existingToken.verified_at = null; // Reset verification status
      return this.repository.save(existingToken);
    } else {
      // Create new token
      const token = this.repository.create({
        token: resetToken,
        token_type: tokenType.RESET_PASSWORD,
        token_expire: expiresAt,
        user: user,
      });

      return this.repository.save(token);
    }
  }


  async storeAdminSetPasswordToken(
    user: User,
    resetToken: string,
    expiresAt: Date
  ): Promise<Token> {
    // Check if user already has a password reset token
    const existingToken = await this.repository.findOne({
      where: {
        user: { id: user.id },
        token_type: tokenType.RESET_PASSWORD,
      },
    });

    if (existingToken) {
      // Update existing token
      existingToken.token = resetToken;
      existingToken.token_expire = expiresAt;
      existingToken.verified_at = null; // Reset verification status
      return this.repository.save(existingToken);
    } else {
      // Create new token
      const token = this.repository.create({
        token: resetToken,
        token_type: tokenType.USER_PASSWORD_SET,
        token_expire: expiresAt,
        user: user,
      });

      return this.repository.save(token);
    }
  }
  /**
   * Find password reset token by token string
   */
  async findPasswordResetToken(token: string): Promise<Token | null> {
    return this.repository.findOne({
      where: {
        token: token,
        token_type: tokenType.RESET_PASSWORD,
      },
      relations: ["user", "user.role"],
    });
  }

  /**
   * Invalidate a specific password reset token
   */
  async invalidatePasswordResetToken(token: string): Promise<boolean> {
    const result = await this.repository.delete({
      token: token,
      token_type: tokenType.RESET_PASSWORD,
    });
    return result.affected !== 0;
  }

  /**
   * Invalidate all password reset tokens for a user
   */
  async invalidateUserPasswordResetTokens(userId: string): Promise<boolean> {
    const result = await this.repository.delete({
      user: { id: userId },
      token_type: tokenType.RESET_PASSWORD,
    });
    return result.affected !== 0;
  }

  /**
   * Check if password reset token exists and is valid
   */
  async isPasswordResetTokenValid(token: string): Promise<boolean> {
    const tokenRecord = await this.repository.findOne({
      where: {
        token: token,
        token_type: tokenType.RESET_PASSWORD,
      },
    });

    if (!tokenRecord) {
      return false;
    }

    // Check if token is expired
    return tokenRecord.token_expire > new Date();
  }

  /**
   * Find password reset token by jti and verify user match
   */
  async findAndVerifyPasswordResetToken(
    jti: string,
    userId: string
  ): Promise<Token | null> {
    const tokenRecord = await this.repository.findOne({
      where: {
        token: jti,
        token_type: tokenType.RESET_PASSWORD,
      },
      relations: ["user"],
    });

    if (!tokenRecord) {
      return null;
    }

    // Check if the user ID matches
    if (tokenRecord.user.id !== userId) {
      return null;
    }

    // Check if token is expired
    if (tokenRecord.token_expire <= new Date()) {
      return null;
    }

    return tokenRecord;
  }

  /**
   * Mark password reset token as verified
   */
  async markPasswordResetTokenAsVerified(tokenId: string): Promise<boolean> {
    const result = await this.repository.update(
      { id: tokenId },
      { verified_at: new Date() }
    );
    return result.affected !== 0;
  }

  /**
   * Update token record
   */
  async updateToken(
    tokenId: string,
    updateData: Partial<Token>
  ): Promise<boolean> {
    const result = await this.repository.update({ id: tokenId }, updateData);
    return result.affected !== 0;
  }
}
