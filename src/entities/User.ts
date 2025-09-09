import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Role } from "./Role";
import { Token } from "./Token";
import { UserLimit } from "./UserLimit";
import bcrypt from "bcryptjs";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  userName!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  company?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  department?: string | null;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  suspend_at?: Date | null;

  // Soft-delete column with explicit snake_case name
  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at", nullable: true })
  deleted_at?: Date | null;

  @Column({ type: "varchar", length: 255 })
  password?: string;

  @Column({ type: "varchar", nullable: true })
  avatar?: string;

  // Self-referencing relation: which user created this user
  @ManyToOne(() => User, user => user.createdUsers, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "created_by" })
  createdBy?: User | null;

  // Inverse side: users that were created by this user
  @OneToMany(() => User, user => user.createdBy)
  createdUsers!: User[];

  // Role relation
  @ManyToOne(() => Role, role => role.users, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "role_id" })
  role?: Role | null;

  // Tokens issued for this user
  @OneToMany(() => Token, token => token.user)
  tokens!: Token[];

  // One-to-one user limits
  @OneToOne(() => UserLimit, (limit: UserLimit) => limit.user)
  limits?: UserLimit;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    if (!this.password) return;
    // Avoid re-hashing if already hashed (bcrypt hashes are ~60 chars)
    if (this.password.length >= 55) return;
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  async validatePassword(plain: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plain, this.password);
  }
}
