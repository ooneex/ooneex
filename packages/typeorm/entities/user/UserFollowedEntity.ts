import type { IUser, IUserFollowed } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "users_followed",
})
export class UserFollowedEntity extends BaseEntity implements IUserFollowed {
  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "user_id" })
  user?: IUser;

  @Column({ name: "user_id", type: "varchar", length: 25, nullable: true })
  userId?: string;

  @Column({ name: "followed_by", type: "varchar", length: 255, nullable: true })
  followedBy?: string;

  @Column({ name: "followed_by_id", type: "varchar", length: 25, nullable: true })
  followedById?: string;
}
