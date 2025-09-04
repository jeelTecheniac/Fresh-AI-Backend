import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";
import { User } from "../entities/User.js";
import { logger } from "../utils/logger.js";
import {
  createConflictError,
  createUnauthorizedError,
  createBadRequestError,
} from "../errors/index.js";

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingUser) {
        throw createConflictError("User with this email already exists");
      }

      // Create new user
      const user = await this.userRepository.create(userData);
      logger.info(`User created successfully: ${user.email}`);

      return user;
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }

  async loginUser(loginData: LoginDto): Promise<{ user: User; token: string }> {
    try {
      const user = await this.userRepository.findByEmailAndPassword(
        loginData.email,
        loginData.password
      );

      if (!user) {
        throw createUnauthorizedError("Invalid email or password");
      }

      if (!user.isActive) {
        throw createUnauthorizedError("User account is deactivated");
      }

      const token = this.generateJWT(user);
      logger.info(`User logged in successfully: ${user.email}`);

      return { user, token };
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

  private generateJWT(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createBadRequestError("JWT_SECRET environment variable is not set");
    }

    const envExpires = process.env.JWT_EXPIRES_IN;
    let signOptions: SignOptions;
    if (!envExpires) {
      signOptions = { expiresIn: 60 * 60 * 24 };
    } else if (!Number.isNaN(Number(envExpires))) {
      signOptions = { expiresIn: Number(envExpires) };
    } else {
      signOptions = { expiresIn: envExpires as unknown as any };
    }
    return jwt.sign(payload, secret as Secret, signOptions);
  }

  async verifyJWT(token: string): Promise<any> {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw createBadRequestError(
          "JWT_SECRET environment variable is not set"
        );
      }

      return jwt.verify(token, secret as Secret);
    } catch (error) {
      logger.error(`JWT verification error: ${error}`);
      throw createUnauthorizedError("Invalid token");
    }
  }
}
