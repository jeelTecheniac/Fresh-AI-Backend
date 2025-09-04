import { Response } from "express";
import {
  UserService,
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
} from "../services/UserService.js";
import { BaseController, AuthenticatedRequest } from "./BaseController.js";
import {
  createUnauthorizedError,
  createBadRequestError,
  createNotFoundError,
} from "../errors/index.js";

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  /**
   * Register a new user
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.handleAsync(
      async () => {
        const userData = this.getValidatedData<CreateUserDto>(req);
        const user = await this.userService.createUser(userData);
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
        const { email, password } = this.getValidatedData<LoginDto>(req);
        const result = await this.userService.loginUser({ email, password });
        return result;
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
}
