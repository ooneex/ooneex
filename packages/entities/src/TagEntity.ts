import type { IColor } from "@ooneex/color";
import type { ITag } from "@ooneex/tag";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { ColorEntity } from "./ColorEntity";

@Entity({
  name: "tags",
})
export class TagEntity extends BaseEntity implements ITag {
  @Column({ name: "name", type: "varchar", length: 100 })
  name!: string;

  @ManyToOne(() => ColorEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "color_id" })
  color?: IColor;
}
