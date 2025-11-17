import type { IBase } from "@ooneex/types";
import { random } from "@ooneex/utils";
import { Column, CreateDateColumn, DeleteDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity implements IBase {
  @PrimaryColumn({ name: "id", type: "varchar", length: 15 })
  id: string = random.nanoid(15);

  @Column({ name: "is_locked", type: "boolean", default: false, nullable: true })
  isLocked?: boolean;

  @Column({ name: "locked_at", type: "timestamptz", nullable: true })
  lockedAt?: Date;

  @Column({ name: "is_blocked", type: "boolean", default: false, nullable: true })
  isBlocked?: boolean;

  @Column({ name: "blocked_at", type: "timestamptz", nullable: true })
  blockedAt?: Date;

  @Column({ name: "block_reason", type: "text", nullable: true })
  blockReason?: string;

  @Column({ name: "is_public", type: "boolean", default: true, nullable: true })
  isPublic?: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt?: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt?: Date;
}
