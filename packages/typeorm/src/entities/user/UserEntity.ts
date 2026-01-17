import type { IImage } from "@ooneex/image";
import type { ERole } from "@ooneex/role";
import type { IAccount, ISession, IUser, IVerification } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "../image/ImageEntity";

@Entity({
  name: "users",
})
export class UserEntity extends BaseEntity implements IUser {
  @Column({ name: "email", type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ name: "roles", type: "simple-array" })
  roles: ERole[];

  @Column({ name: "key", type: "varchar", length: 255, unique: true, nullable: true })
  key?: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ name: "last_name", type: "varchar", length: 255, nullable: true })
  lastName?: string;

  @Column({ name: "first_name", type: "varchar", length: 255, nullable: true })
  firstName?: string;

  @Column({ name: "username", type: "varchar", length: 100, unique: true, nullable: true })
  username?: string;

  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "avatar_id" })
  avatar?: IImage;

  @Column({ name: "bio", type: "text", nullable: true })
  bio?: string;

  @Column({ name: "phone", type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ name: "birth_date", type: "date", nullable: true })
  birthDate?: Date;

  @Column({ name: "timezone", type: "varchar", length: 50, nullable: true })
  timezone?: string;

  @Column({ name: "is_email_verified", type: "boolean", default: false, nullable: true })
  isEmailVerified?: boolean;

  @Column({ name: "is_phone_verified", type: "boolean", default: false, nullable: true })
  isPhoneVerified?: boolean;

  @Column({ name: "last_active_at", type: "timestamptz", nullable: true })
  lastActiveAt?: Date;

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  emailVerifiedAt?: Date;

  @Column({ name: "phone_verified_at", type: "timestamptz", nullable: true })
  phoneVerifiedAt?: Date;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  lastLoginAt?: Date;

  @Column({ name: "password_changed_at", type: "timestamptz", nullable: true })
  passwordChangedAt?: Date;

  @Column({ name: "two_factor_enabled", type: "boolean", default: false, nullable: true })
  twoFactorEnabled?: boolean;

  @Column({ name: "two_factor_secret", type: "varchar", length: 255, nullable: true })
  twoFactorSecret?: string;

  @Column({ name: "recovery_tokens", type: "simple-array", nullable: true })
  recoveryTokens?: string[];

  @OneToMany("SessionEntity", "user", {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  sessions?: ISession[];

  @OneToMany("AccountEntity", "user", {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  accounts?: IAccount[];

  @OneToMany("VerificationEntity", "user", {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  verifications?: IVerification[];
}
