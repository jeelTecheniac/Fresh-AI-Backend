import { Response } from "express";
import { UserService, UpdateUserDto } from "../services/UserService.js";
import { TokenService } from "../services/TokenService.js";
import { RoleService } from "../services/RoleService.js";
import { TokenRepository } from "../repositories/TokenRepository.js";
import { PasswordResetTokenService } from "../services/PasswordResetTokenService.js";
import { TokenDatabaseService } from "../services/TokenDatabaseService.js";
import { PasswordResetEmailService } from "../services/PasswordResetEmailService.js";
import { BaseController, AuthenticatedRequest } from "./BaseController.js";
import {
  createUnauthorizedError,
  createBadRequestError,
  createNotFoundError,
  createConflictError,
} from "../errors/index.js";
import { UserLImitService } from "@/services/UserLimitService.js";

export class UserController extends BaseController {
  private userService: UserService;
  private roleService: RoleService;
  private UserLimitService: UserLImitService;
  private tokenService: TokenService;
  private tokenRepository: TokenRepository;
  private passwordResetTokenService: PasswordResetTokenService;
  private tokenDatabaseService: TokenDatabaseService;
  private passwordResetEmailService: PasswordResetEmailService;

  constructor() {
    super();
    this.userService = new UserService();
    this.UserLimitService = new UserLImitService();
    this.roleService = new RoleService();
    this.tokenService = new TokenService();
    this.tokenRepository = new TokenRepository();
    this.passwordResetTokenService = new PasswordResetTokenService();
    this.tokenDatabaseService = new TokenDatabaseService();
    this.passwordResetEmailService = new PasswordResetEmailService();
  }

  /**
   * Register a new user
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const CreatedByUSer = req.user;
        const role = await this.roleService.getRoleIdByName("admin");
        const data = {
          fullName: req.body.fullName,
          userName: req.body.userName,
          email: req.body.email,
          company: req.body.company,
          department: req.body.department,
          password: req.body.password,
          avatar: req.body.avatar,
          createdBy: CreatedByUSer || null,
          role: role,
        };

        const isTaken = await this.userService.isEmailTaken(req.body.email);
        if (isTaken) {
          throw createConflictError("User with this email already exists");
        }
        const user = await this.userService.createUser(data);

        if (!user) {
          throw createBadRequestError("User creation failed");
        }

        const LimitData = {
          user: user,
          total_user_license: req.body.totalUserLicenses || null,
          max_persona: req.body.maxPersonas,
          max_image_upload: req.body.maxImageUpload,
          monthly_query_limit: req.body.monthlyQueryLimit,
          max_document_upload: req.body.maxDocumentUpload,
        };

        await this.UserLimitService.createUserLimit(LimitData);

        if (user) {
          const adminSetUserPasswordToken =
            await this.passwordResetTokenService.generateAndStoreRsetAdminPasswordToken(
              user
            );
          await this.passwordResetEmailService.sendPasswordResetEmailWithMessage(
            user,
            adminSetUserPasswordToken
          );
        }

        return this.sanitizeData(user);
      },
      req,
      res,
      "User registration"
    );
  }

  async resendAdminPasswordSetMail(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.handleAsync(
      async () => {
        const { userId } = req.params;
        if (!userId) {
          throw createBadRequestError("User ID is required");
        }
        const token =
          await this.tokenDatabaseService.verifyResenMailToken(userId);

        const adminSetUserPasswordToken =
          await this.passwordResetTokenService.generateAndStoreRsetAdminPasswordToken(
            token.user
          );
        await this.passwordResetEmailService.sendPasswordResetEmailWithMessage(
          token.user,
          adminSetUserPasswordToken
        );
        // const token = await this.tokenRepository.getTokenFromUserId();
      },
      req,
      res,
      "Resend the Admin Password set Mail"
    );
  }

  /**
   * User login
   */
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const user = await this.userService.loginUser(req.body);
        const tokenPayload = this.tokenService.createTokenPayload(user);
        const { accessToken, refreshToken } =
          this.tokenService.generateTokenPair(tokenPayload);

        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 90); // 3 months
        await this.tokenRepository.storeRefreshToken(
          user,
          refreshToken,
          refreshTokenExpiry
        );

        return {
          user: this.sanitizeData(user, [
            "password",
            "role",
            "suspend_at",
            "deleted_at",
          ]),
          accessToken,
          refreshToken,
        };
      },
      req,
      res,
      "User login"
    );
  }

  /**
   * Get current user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const userId = this.getUserId(req);
        if (!userId) {
          throw createUnauthorizedError("User not authenticated");
        }

        const user = await this.userService.getUserById(userId);
        if (!user) {
          throw createNotFoundError("User not found");
        }
        return this.sanitizeData(user);
      },
      req,
      res,
      "Get user profile"
    );
  }

  /**
   * Update current user profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const userId = this.getUserId(req);
        if (!userId) {
          throw createUnauthorizedError("User not authenticated");
        }

        const updateData = this.getValidatedData<UpdateUserDto>(req);
        const user = await this.userService.updateUser(userId, updateData);
        if (!user) {
          throw createNotFoundError("User not found");
        }
        return this.sanitizeData(user);
      },
      req,
      res,
      "Update user profile"
    );
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const pagination = this.getPagination(req);
        const { users, total } = await this.userService.getAllUsers(
          pagination?.limit || 10,
          pagination?.offset || 0
        );

        const sanitizedUsers = users.map(user => this.sanitizeData(user));

        return this.createPaginationResponse(
          sanitizedUsers,
          total,
          pagination?.page || 1,
          pagination?.limit || 10
        );
      },
      req,
      res,
      "Get all users"
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const { id } = req.params;
        if (!id) {
          throw createBadRequestError("User ID is required");
        }
        const user = await this.userService.getUserById(id);
        if (!user) {
          throw createNotFoundError("User not found");
        }
        return this.sanitizeData(user);
      },
      req,
      res,
      "Get user by ID"
    );
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const { id } = req.params;
        if (!id) {
          throw createBadRequestError("User ID is required");
        }
        await this.userService.deleteUser(id);
        return { message: "User deleted successfully" };
      },
      req,
      res,
      "Delete user"
    );
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
          throw createBadRequestError("Refresh token is required");
        }

        // Verify refresh token
        const decoded = this.tokenService.verifyRefreshToken(refreshToken);

        // Check if refresh token exists in database and is valid
        const tokenRecord =
          await this.tokenRepository.findRefreshToken(refreshToken);
        if (
          !tokenRecord ||
          !(await this.tokenRepository.isRefreshTokenValid(refreshToken))
        ) {
          throw createUnauthorizedError("Invalid or expired refresh token");
        }

        // Get user with role information
        const user = await this.userService.getUserById(decoded.userId);
        if (!user) {
          throw createNotFoundError("User not found");
        }

        // Generate new access token
        const tokenPayload = this.tokenService.createTokenPayload(user);
        const accessToken = this.tokenService.generateAccessToken(tokenPayload);

        return {
          accessToken,
          user: this.sanitizeData(user, [
            "password",
            "role",
            "suspend_at",
            "deleted_at",
          ]),
        };
      },
      req,
      res,
      "Refresh token"
    );
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const { refreshToken } = req.body;

        if (refreshToken) {
          await this.tokenRepository.invalidateRefreshToken(refreshToken);
        }

        return { message: "Logged out successfully" };
      },
      req,
      res,
      "User logout"
    );
  }

  /**
   * Forgot password - send reset email (handles both initial request and resend)
   */
  async forgotPassword(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.handleAsync(
      async () => {
        // Validate user for password reset
        const user = await this.userService.validateUserForPasswordReset(
          req.body.email
        );

        // Always return success message for security (don't reveal if email exists)
        const result = {
          message: "If the email exists, a password reset link has been sent.",
        };

        // If user exists and is valid, generate/store token and send email
        if (user) {
          const resetToken =
            await this.passwordResetTokenService.generateAndStoreResetToken(
              user
            );
          await this.passwordResetEmailService.sendPasswordResetEmail(
            user,
            resetToken
          );
        }

        return result;
      },
      req,
      res,
      "Forgot password"
    );
  }

  /**
   * Verify password reset token
   */
  async verifyResetPasswordToken(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    await this.handleAsync(
      async () => {
        const { token } = req.query;

        // Step 1: Verify JWT token and extract payload
        const payload = this.tokenService.verifyPasswordResetToken(
          token as string
        );
        // Step 2: Find and verify token in database
        const tokenRecord =
          await this.tokenDatabaseService.findAndVerifyPasswordResetToken(
            payload.jti,
            payload.userId
          );

        // Step 3: Mark token as verified
        await this.tokenDatabaseService.updateToken(tokenRecord.id, {
          verified_at: new Date(),
        });

        return {
          message: "Token verified successfully",
          verified: true,
        };
      },
      req,
      res,
      "Verify password reset token"
    );
  }

  async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const { token, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
          throw createBadRequestError(
            "New password and confirm password do not match"
          );
        }

        // Step 1: Verify JWT token and extract payload
        const payload = this.tokenService.verifyPasswordResetToken(
          token as string
        );

        // Step 2: Find and verify token in database
        const tokenRecord =
          await this.tokenDatabaseService.findPasswordResetToken(payload.jti);

        if (!tokenRecord || !tokenRecord?.verified_at) {
          throw createBadRequestError(
            "Invalid or expired password reset token"
          );
        }
        // Step 3: Mark token as verified
        await this.userService.updateUser(tokenRecord?.user.id, {
          password: password,
        });

        await this.tokenDatabaseService.updateToken(tokenRecord.id, {
          verified_at: null,
        });
        return {
          message: "Password reset successfully",
          verified: true,
        };
      },
      req,
      res,
      "Reset Password"
    );
  }
}
