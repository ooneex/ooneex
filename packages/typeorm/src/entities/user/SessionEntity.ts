import type { ISession, IUser } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "sessions",
})
export class SessionEntity extends BaseEntity implements ISession {
  @Column({ name: "token", type: "varchar", length: 255, unique: true })
  token: string;

  @Column({ name: "refresh_token", type: "varchar", length: 255, nullable: true })
  refreshToken?: string;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent?: string;

  @Column({ name: "ip_address", type: "inet", nullable: true })
  ipAddress?: string;

  @Column({ name: "device_type", type: "varchar", length: 50, nullable: true })
  deviceType?: string;

  @Column({ name: "device_name", type: "varchar", length: 255, nullable: true })
  deviceName?: string;

  @Column({ name: "browser", type: "varchar", length: 255, nullable: true })
  browser?: string;

  @Column({ name: "operating_system", type: "varchar", length: 255, nullable: true })
  operatingSystem?: string;

  @Column({ name: "location", type: "varchar", length: 255, nullable: true })
  location?: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @Column({ name: "last_access_at", type: "timestamptz", nullable: true })
  lastAccessAt?: Date;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt?: Date;

  @Column({ name: "revoked_reason", type: "varchar", length: 255, nullable: true })
  revokedReason?: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.sessions,
    {
      nullable: true,
      eager: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "user_id" })
  user?: IUser;
}
