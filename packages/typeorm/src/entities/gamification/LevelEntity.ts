import type { ILevel } from "@ooneex/gamification";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "levels",
})
export class LevelEntity extends BaseEntity implements ILevel {
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "code", type: "varchar", length: 100, unique: true })
  code: string;

  @Column({ name: "color", type: "varchar", length: 7 })
  color: string;
}
