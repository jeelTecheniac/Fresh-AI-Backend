import { User } from "../entities/User.js";
import { EmailService } from "./EmailService.js";
import { logger } from "../utils/logger.js";

export class PasswordResetEmailService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Send password reset email to user
   */
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.fullName
      );
      logger.info(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      logger.error(`Password reset email sending error: ${error}`);
      throw error;
    }
  }

  /**
   * Send password reset email with custom message
   */
  async sendPasswordResetEmailWithMessage(
    user: User,
    resetToken: string,
    _customMessage?: string
  ): Promise<void> {
    try {
      // For now, use the standard email service
      // In the future, this could be extended to support custom messages
      await this.emailService.sendAdminPasswordSetEmail(
        user,
        user.email,
        resetToken
      );
      logger.info(
        `Password reset email with custom message sent to: ${user.email}`
      );
    } catch (error) {
      logger.error(
        `Password reset email with custom message sending error: ${error}`
      );
      throw error;
    }
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmationEmail(user: User): Promise<void> {
    try {
      // This would be a different email template for confirmation
      // For now, we'll use the same service but with a different template
      // In a real implementation, you'd create a confirmation email template
      logger.info(
        `Password reset confirmation email would be sent to: ${user.email}`
      );

      // TODO: Implement confirmation email template and sending
      // await this.emailService.sendConfirmationEmail(user.email, user.fullName);
    } catch (error) {
      logger.error(`Password reset confirmation email sending error: ${error}`);
      throw error;
    }
  }
}
