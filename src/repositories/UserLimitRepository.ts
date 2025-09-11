import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source.js";
import { UserLimit } from "@/entities/UserLimit.js";

export class UserLimitRepository {
  private repository: Repository<UserLimit>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserLimit);
  }

  async create(userData: Partial<UserLimit>): Promise<UserLimit> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }
}
