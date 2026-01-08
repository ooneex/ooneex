import type { IUser, IUserBlocked } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "users_blocked",
})
export class UserBlockedEntity extends BaseEntity implements IUserBlocked {
  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "user_id" })
  user?: IUser;

  @Column({ name: "user_id", type: "varchar", length: 25, nullable: true })
  userId?: string;

  @Column({ name: "blocked_by", type: "varchar", length: 255, nullable: true })
  blockedBy?: string;

  @Column({ name: "blocked_by_id", type: "varchar", length: 25, nullable: true })
  blockedById?: string;

  @Column({ name: "reason", type: "text", nullable: true })
  reason?: string;
}
