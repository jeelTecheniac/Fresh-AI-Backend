import { User } from "../entities/User.js";
import { TokenService } from "./TokenService.js";
import { TokenRepository } from "../repositories/TokenRepository.js";
import { logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

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
      const jti = uuidv4();
      const tokenPayload = {
        jti,
        userId: user.id,
      };
      const resetToken =
        this.tokenService.generatePasswordResetToken(tokenPayload);

      // Store reset token in database (expires in 1 hour)
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

      await this.tokenRepository.storePasswordResetToken(
        user,
        jti,
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
}
