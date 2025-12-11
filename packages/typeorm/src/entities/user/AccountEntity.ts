import type { IAccount, IUser } from "@ooneex/user";
import { EAccountType } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "accounts",
})
export class AccountEntity extends BaseEntity implements IAccount {
  @Column({ name: "provider", type: "varchar", length: 100, nullable: true })
  provider?: string;

  @Column({ name: "provider_account_id", type: "varchar", length: 255, nullable: true })
  providerAccountId?: string;

  @Column({
    name: "type",
    type: "enum",
    enum: EAccountType,
  })
  type: EAccountType;

  @Column({ name: "password", type: "varchar", length: 255, nullable: true })
  password?: string;

  @Column({ name: "access_token", type: "text", nullable: true })
  accessToken?: string;

  @Column({ name: "access_token_expires_at", type: "timestamptz", nullable: true })
  accessTokenExpiresAt?: Date;

  @Column({ name: "refresh_token", type: "text", nullable: true })
  refreshToken?: string;

  @Column({ name: "refresh_token_expires_at", type: "timestamptz", nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: Date;

  @Column({ name: "token_type", type: "varchar", length: 50, nullable: true })
  tokenType?: string;

  @Column({ name: "scope", type: "text", nullable: true })
  scope?: string;

  @Column({ name: "id_token", type: "text", nullable: true })
  idToken?: string;

  @Column({ name: "session_state", type: "varchar", length: 255, nullable: true })
  sessionState?: string;

  @Column({ name: "email", type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ name: "email_verified", type: "boolean", default: false, nullable: true })
  emailVerified?: boolean;

  @Column({ name: "name", type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ name: "picture", type: "varchar", length: 500, nullable: true })
  picture?: string;

  @Column({ name: "profile", type: "jsonb", nullable: true })
  profile?: Record<string, unknown>;

  @ManyToOne(
    () => UserEntity,
    (user) => user.accounts,
    {
      nullable: true,
      eager: false,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "user_id" })
  user?: IUser;
}
