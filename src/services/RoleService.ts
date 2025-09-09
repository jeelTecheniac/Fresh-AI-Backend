import { Role } from "../entities/Role.js";
import { RoleRepository } from "../repositories/RoleRepository.js";
import { logger } from "../utils/logger.js";
import { createConflictError } from "../errors/index.js";

export interface CreateRoleDto {
  name: string;
}

export class RoleService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async createRole(data: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepository.existsByName(data.name);
    if (exists) {
      throw createConflictError("Role with this name already exists");
    }
    const role = await this.roleRepository.create({ name: data.name });
    logger.info(`Role created: ${role.name}`);
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findByName(name);
  }
}


