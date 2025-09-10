import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source.js";
import { User } from "../entities/User.js";

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(
    limit = 10,
    offset = 0
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: "DESC" },
    });

    return { users, total };
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await this.repository.findOneBy({ id });
    if (!user) return null;

    Object.assign(user, userData);
    return this.repository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isVerified: false });
    return result.affected !== 0;
  }

  async findByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { email },
      relations: ["role"],
    });
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}
