import type { IUser, IVerification } from "@ooneex/user";
import { EVerificationType } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "verifications",
})
export class VerificationEntity extends BaseEntity implements IVerification {
  @Column({ name: "email", type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ name: "token", type: "varchar", length: 255, unique: true })
  token: string;

  @Column({
    name: "type",
    type: "enum",
    enum: EVerificationType,
  })
  type: EVerificationType;

  @Column({ name: "code", type: "varchar", length: 10, nullable: true })
  code?: string;

  @Column({ name: "is_used", type: "boolean", default: false })
  isUsed: boolean;

  @Column({ name: "used_at", type: "timestamptz", nullable: true })
  usedAt?: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @Column({ name: "attempts_count", type: "int", default: 0 })
  attemptsCount: number;

  @Column({ name: "max_attempts", type: "int", default: 5 })
  maxAttempts: number;

  @Column({ name: "ip_address", type: "inet", nullable: true })
  ipAddress?: string;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent?: string;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.verifications,
    {
      nullable: true,
      eager: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "user_id" })
  user?: IUser;
}
