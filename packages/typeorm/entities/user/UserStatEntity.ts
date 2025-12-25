import type { IUser, IUserStat } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "users_stats",
})
export class UserStatEntity extends BaseEntity implements IUserStat {
  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "user_id" })
  user?: IUser;

  @Column({ name: "user_id", type: "varchar", length: 25, nullable: true })
  userId?: string;

  @Column({ name: "followers_count", type: "int", default: 0, nullable: true })
  followersCount?: number;

  @Column({ name: "following_count", type: "int", default: 0, nullable: true })
  followingCount?: number;

  @Column({ name: "blocked_count", type: "int", default: 0, nullable: true })
  blockedCount?: number;

  @Column({ name: "views_count", type: "int", default: 0, nullable: true })
  viewsCount?: number;

  @Column({ name: "reports_count", type: "int", default: 0, nullable: true })
  reportsCount?: number;
}
