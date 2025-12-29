import type { IMedecineYear } from "@ooneex/education/medecine";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "medecine_years",
})
export class MedecineYearEntity extends BaseEntity implements IMedecineYear {
  @Column({ name: "code", type: "varchar", length: 20, unique: true })
  code: string;

  @Column({ name: "name", type: "varchar", length: 100 })
  name: string;

  @Column({ name: "number", type: "int" })
  number: number;

  @Column({ name: "color", type: "varchar", length: 20, nullable: true })
  color?: string;
}
