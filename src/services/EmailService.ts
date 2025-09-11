import { logger } from "../utils/logger.js";
import nodemailer from "nodemailer";
import { User } from "../entities/User.js";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const emailOptions: EmailOptions = {
      to: email,
      subject: "Password Reset Request - Fresh AI",
      html: this.generatePasswordResetEmailHTML(userName, resetUrl),
      text: this.generatePasswordResetEmailText(userName, resetUrl),
    };

    try {
      await this.sendEmail(emailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}: ${error}`);
      throw error;
    }
  }

  async sendAdminPasswordSetEmail(
    user: User,
    email: string,
    resetToken: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const emailOptions: EmailOptions = {
      to: email,
      subject: "Password Reset Request - Fresh AI",
      html: this.generateAdminPasswordSetEmailHTML(user, resetUrl),
      text: this.generateAdminPasswordSetEmailText(user, resetUrl),
    };

    try {
      await this.sendEmail(emailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}: ${error}`);
      throw error;
    }
  }

  /**
   * Send email via Gmail SMTP (App Password)
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error(
        "GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables"
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `Fresh AI <${user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  /**
   * Generate HTML content for password reset email
   */
  private generatePasswordResetEmailHTML(
    userName: string,
    resetUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { 
              display: inline-block; 
              background-color: #007bff; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Fresh AI</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${userName},</p>
              <p>We received a request to reset your password for your Fresh AI account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Fresh AI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateAdminPasswordSetEmailHTML(
    user: User,
    resetUrl: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Fresh AI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .section-title { font-weight: bold; margin-top: 20px; }
          .details p { margin: 4px 0; }
          .steps ol { padding-left: 20px; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Fresh AI</h1>
          </div>
          <div class="content">
            <p>Hi ${user.fullName},</p>
            <p>
              I've set up your account for Fresh.ai. You'll find your login details below. 
              Please use these to get started at your convenience.
            </p>
            <p>If you run into any issues, let me know and I'll be happy to help.</p>
            <p>Best,</p>

            <h3>📎 Join ${user.company} Research Platform!</h3>

            <div class="section-title">🔹 Details:</div>
            <div class="details">
              <p><strong>Name:</strong> ${user.fullName}</p>
              <p><strong>Username:</strong> ${user.userName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Company:</strong> ${user.company}</p>
              <p><strong>Department:</strong> ${user.department}</p>
            </div>

            <div class="section-title">📝 Steps:</div>
            <div class="steps">
              <ol>
                <li>Visit: <a href="${resetUrl}">${resetUrl}</a></li>
                <li>Click "Sign In with Google"</li>
                <li>Sign in with Google (${user.email})</li>
                <li>Your administrator will activate your account</li>
              </ol>
            </div>

            <div class="section-title">🔑 Login Link:</div>
            <p><a href="${resetUrl}" class="button">Go to Fresh.ai</a></p>
          </div>

          <div class="footer">
            <p>© 2025 Fresh AI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  /**
   * Generate text content for password reset email
   */
  private generatePasswordResetEmailText(
    userName: string,
    resetUrl: string
  ): string {
    return `
Password Reset Request - Fresh AI

Hello ${userName},

We received a request to reset your password for your Fresh AI account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
Fresh AI Team

© 2025 Fresh AI. All rights reserved.
    `;
  }

  private generateAdminPasswordSetEmailText(
    user: User,
    loginUrl: string
  ): string {
    return `
Welcome to Fresh AI

Hi ${user.fullName},

I've set up your account for Fresh.ai. You'll find your login details below. 
Please use these to get started at your convenience.

If you run into any issues, let me know and I'll be happy to help.
Best,

Join ${user.company} Research Platform!

Details:
- Name: ${user.fullName}
- Username: ${user.userName}
- Email: ${user.email}
- Company: ${user.company}
- Department: ${user.department}

Steps:
1. Visit: ${loginUrl}
2. Click "Sign In with Google"
3. Sign in with Google (${user.email})
4. Your administrator will activate your account

Login Link: ${loginUrl}

© 2025 Fresh AI. All rights reserved.
  `;
  }
}
