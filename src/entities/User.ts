import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import bcrypt from "bcryptjs";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 100 })
  firstName!: string;

  @Column({ type: "varchar", length: 100 })
  lastName!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  avatar?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified!: boolean;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && this.password.length < 60) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON(): Omit<
    User,
    | "password"
    | "hashPassword"
    | "validatePassword"
    | "fullName"
    | "toJSON"
    | "updateUser"
    | "isFullyVerified"
    | "getDisplayName"
    | "getInitials"
  > {
    const {
      password,
      hashPassword,
      validatePassword,
      fullName,
      toJSON,
      updateUser,
      isFullyVerified,
      getDisplayName,
      getInitials,
      ...userWithoutMethods
    } = this;
    return userWithoutMethods;
  }

  /**
   * Create a new User instance with validation
   */
  static createUser(userData: Partial<User>): User {
    const user = new User();
    Object.assign(user, userData);
    return user;
  }

  /**
   * Update user data
   */
  updateUser(updateData: Partial<User>): void {
    Object.assign(this, updateData);
  }

  /**
   * Check if user is active and verified
   */
  isFullyVerified(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  /**
   * Get user display name
   */
  getDisplayName(): string {
    return this.fullName || this.email;
  }

  /**
   * Get user initials
   */
  getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
}
