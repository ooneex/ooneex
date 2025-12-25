import type { IUser, IUserReport } from "@ooneex/user";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { UserEntity } from "./UserEntity";

@Entity({
  name: "users_reports",
})
export class UserReportEntity extends BaseEntity implements IUserReport {
  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "user_id" })
  user?: IUser;

  @Column({ name: "user_id", type: "varchar", length: 25, nullable: true })
  userId?: string;

  @Column({ name: "reason", type: "varchar", length: 255 })
  reason: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "reported_by", type: "varchar", length: 255, nullable: true })
  reportedBy?: string;

  @Column({ name: "reported_by_id", type: "varchar", length: 25, nullable: true })
  reportedById?: string;
}
