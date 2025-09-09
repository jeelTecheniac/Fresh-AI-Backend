import { UserRepository } from "../repositories/UserRepository.js";
import { User } from "../entities/User.js";
import { logger } from "../utils/logger.js";
import { createUnauthorizedError } from "../errors/index.js";

export interface CreateUserDto {
  fullName: string;
  username: string;
  email: string;
  company?: string | null;
  department?: string | null;
  password?: string;
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

export interface ForgotPasswordDto {
  email: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.create(userData);
      logger.info(`User created successfully: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      logger.error(`Error finding user by email: ${error}`);
      throw error;
    }
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  async loginUser(loginData: LoginDto): Promise<User> {
    try {
      const user = await this.userRepository.findByEmailAndPassword(
        loginData.email,
        loginData.password
      );

      if (!user) {
        throw createUnauthorizedError("Invalid email or password");
      }

      if (!user.isVerified) {
        throw createUnauthorizedError("User account is deactivated");
      }

      logger.info(`User logged in successfully: ${user.email}`);

      return user;
    } catch (error) {
      logger.error(`Login error: ${error}`);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(id);
    } catch (error) {
      logger.error(`Error fetching user by ID: ${error}`);
      throw error;
    }
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto
  ): Promise<User | null> {
    try {
      const user = await this.userRepository.update(id, updateData);
      if (user) {
        logger.info(`User updated successfully: ${user.email}`);
      }
      return user;
    } catch (error) {
      logger.error(`Error updating user: ${error}`);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.userRepository.softDelete(id);
      if (result) {
        logger.info(`User deleted successfully: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error(`Error deleting user: ${error}`);
      throw error;
    }
  }

  async getAllUsers(
    limit = 10,
    offset = 0
  ): Promise<{ users: User[]; total: number }> {
    try {
      return await this.userRepository.findAll(limit, offset);
    } catch (error) {
      logger.error(`Error fetching users: ${error}`);
      throw error;
    }
  }

  /**
   * Validate user for password reset
   */
  async validateUserForPasswordReset(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        // For security, don't reveal if email exists or not
        logger.info(
          `Forgot password requested for non-existent email: ${email}`
        );
        return null;
      }

      if (!user.isVerified) {
        throw createUnauthorizedError("Account is not verified");
      }

      logger.info(`User validated for password reset: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`User validation error for password reset: ${error}`);
      throw error;
    }
  }
}
