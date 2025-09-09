import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("user_limits")
export class UserLimit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => User, user => user.limits, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "int", default: 0 })
  total_user_license!: number;

  @Column({ type: "int", default: 0 })
  max_persona!: number;

  @Column({ type: "int", default: 0 })
  max_image_upload!: number;

  @Column({ type: "int", default: 0 })
  monthly_query_limit!: number;

  @Column({ type: "int", default: 0 })
  max_document_upload!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
