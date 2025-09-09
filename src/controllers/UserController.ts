import { Response } from "express";
import {
  UserService,
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
} from "../services/UserService.js";
import { TokenService } from "../services/TokenService.js";
import { TokenRepository } from "../repositories/TokenRepository.js";
import { BaseController, AuthenticatedRequest } from "./BaseController.js";
import {
  createUnauthorizedError,
  createBadRequestError,
  createNotFoundError,
  createConflictError,
} from "../errors/index.js";

export class UserController extends BaseController {
  private userService: UserService;
  private tokenService: TokenService;
  private tokenRepository: TokenRepository;

  constructor() {
    super();
    this.userService = new UserService();
    this.tokenService = new TokenService();
    this.tokenRepository = new TokenRepository();
  }

  /**
   * Register a new user
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const isTaken = await this.userService.isEmailTaken(req.body.email);
        if (isTaken) {
          throw createConflictError("User with this email already exists");
        }

        const user = await this.userService.createUser(req.body);
        return this.sanitizeData(user);
      },
      req,
      res,
      "User registration"
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
}
