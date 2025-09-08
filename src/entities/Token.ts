import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50 })
  token_type!: string;

  @Column({ type: "timestamptz" })
  token_expire!: Date;

  @Column({ type: "varchar", length: 500, unique: true })
  token!: string;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}


