import type { IColor } from "@ooneex/color";
import { EStatus, type IStatus, type StatusType } from "@ooneex/status";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { ColorEntity } from "./ColorEntity";

@Entity({
  name: "statuses",
})
export class StatusEntity extends BaseEntity implements IStatus {
  @Column({
    name: "status",
    type: "enum",
    enum: EStatus,
  })
  status: StatusType;

  @ManyToOne(() => ColorEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "color_id" })
  color?: IColor;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "reason", type: "text", nullable: true })
  reason?: string;
}
