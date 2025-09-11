import { UserLimitRepository } from "@/repositories/UserLimitRepository";
import { UserLimit } from "@/entities/UserLimit";
import { User } from "@/entities/User";
import { logger } from "../utils/logger.js";

export interface CreateUserLimitDto {
  user: User;
  total_user_license: number;
  max_persona: number;
  max_image_upload: number;
  monthly_query_limit?: number | null;
  max_document_upload?: number | null;
}

export class UserLImitService {
  private userLimitRepository: UserLimitRepository;

  constructor() {
    this.userLimitRepository = new UserLimitRepository();
  }

  async createUserLimit(userLimitData: CreateUserLimitDto): Promise<UserLimit> {
    try {
      console.log(userLimitData, "userLimitData");
      const user = await this.userLimitRepository.create(userLimitData);
      logger.info(`User Limit created successfully: ${user}`);
      return user;
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userLimitRepository.findByEmail(email);
    } catch (error) {
      logger.error(`Error finding user by email: ${error}`);
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

  
}
