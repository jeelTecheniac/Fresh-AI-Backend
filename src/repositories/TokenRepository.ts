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
        token_type: "refresh",
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
      token_type: "refresh",
    });
    return result.affected !== 0;
  }

  /**
   * Invalidate all refresh tokens for a user
   */
  async invalidateUserRefreshTokens(userId: string): Promise<boolean> {
    const result = await this.repository.delete({
      user: { id: userId },
      token_type: "refresh",
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
        token_type: "refresh",
      },
    });

    if (!tokenRecord) {
      return false;
    }

    // Check if token is expired
    return tokenRecord.token_expire > new Date();
  }
}
