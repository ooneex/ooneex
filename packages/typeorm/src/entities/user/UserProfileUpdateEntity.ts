import type { IUser, IUserProfileUpdate, IVerification } from "@ooneex/user";
import { EProfileUpdateStatus } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";
import { VerificationEntity } from "./VerificationEntity";

@Entity({
  name: "user_profile_updates",
})
export class UserProfileUpdateEntity extends BaseEntity implements IUserProfileUpdate {
  @Column({ name: "changed_fields", type: "simple-array" })
  changedFields: string[];

  @Column({ name: "previous_values", type: "jsonb", nullable: true })
  previousValues?: Record<string, unknown>;

  @Column({ name: "new_values", type: "jsonb", nullable: true })
  newValues?: Record<string, unknown>;

  @Column({ name: "update_reason", type: "varchar", length: 255, nullable: true })
  updateReason?: string;

  @Column({ name: "ip_address", type: "inet", nullable: true })
  ipAddress?: string;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent?: string;

  @Column({ name: "requires_verification", type: "boolean", default: false, nullable: true })
  requiresVerification?: boolean;

  @Column({
    name: "status",
    type: "enum",
    enum: EProfileUpdateStatus,
  })
  status: EProfileUpdateStatus;

  @Column({ name: "applied_at", type: "timestamptz", nullable: true })
  appliedAt?: Date;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user?: IUser;

  @ManyToOne(() => VerificationEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "verification_id" })
  verification?: IVerification;
}
