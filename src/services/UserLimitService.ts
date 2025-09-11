import { UserLimitRepository } from "@/repositories/UserLimitRepository";
import { UserLimit } from "@/entities/UserLimit";
import { User } from "@/entities/User";
import { logger } from "../utils/logger.js";

export interface CreateUserLimitDto {
  user: User;
  total_user_license: number;
  max_persona: number;
  max_image_upload: number;
  monthly_query_limit?: number;
  max_document_upload?: number;
}

export class UserLImitService {
  private userLimitRepository: UserLimitRepository;

  constructor() {
    this.userLimitRepository = new UserLimitRepository();
  }

  async createUserLimit(userLimitData: CreateUserLimitDto): Promise<UserLimit> {
    try {
      const user = await this.userLimitRepository.create(userLimitData);
      logger.info(`User Limit created successfully: ${user}`);
      return user;
    } catch (error) {
      logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }
}
