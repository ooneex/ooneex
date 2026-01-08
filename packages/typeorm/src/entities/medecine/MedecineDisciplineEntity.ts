import type { IMedecineDiscipline } from "@ooneex/education/medecine";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "medecine_disciplines",
})
export class MedecineDisciplineEntity extends BaseEntity implements IMedecineDiscipline {
  @Column({ name: "code", type: "varchar", length: 50, unique: true })
  code: string;

  @Column({ name: "name", type: "varchar", length: 200 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;
}
