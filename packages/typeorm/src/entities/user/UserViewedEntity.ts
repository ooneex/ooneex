import type { IUser, IUserViewed } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "users_viewed",
})
export class UserViewedEntity extends BaseEntity implements IUserViewed {
  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "user_id" })
  user?: IUser;

  @Column({ name: "user_id", type: "varchar", length: 25, nullable: true })
  userId?: string;

  @Column({ name: "viewed_by", type: "varchar", length: 255, nullable: true })
  viewedBy?: string;

  @Column({ name: "viewed_by_id", type: "varchar", length: 25, nullable: true })
  viewedById?: string;
}
