import { User } from "../entities/User.js";
import { PasswordResetTokenService } from "./PasswordResetTokenService.js";
import { PasswordResetEmailService } from "./PasswordResetEmailService.js";
import { logger } from "../utils/logger.js";

export class ForgotPasswordService {
  private passwordResetTokenService: PasswordResetTokenService;
  private passwordResetEmailService: PasswordResetEmailService;

  constructor() {
    this.passwordResetTokenService = new PasswordResetTokenService();
    this.passwordResetEmailService = new PasswordResetEmailService();
  }

  /**
   * Initiate forgot password process
   */
  async initiateForgotPassword(user: User): Promise<{ message: string }> {
    try {
      // Generate and store password reset token
      const resetToken =
        await this.passwordResetTokenService.generateAndStoreResetToken(user);

      // Send reset email
      await this.passwordResetEmailService.sendPasswordResetEmail(
        user,
        resetToken
      );

      logger.info(`Password reset initiated for user: ${user.email}`);
      return {
        message: "If the email exists, a password reset link has been sent.",
      };
    } catch (error) {
      logger.error(`Forgot password service error: ${error}`);
      throw error;
    }
  }
}
