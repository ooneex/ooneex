import type { IMedecineField } from "@ooneex/education/medecine";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "medecine_fields",
})
export class MedecineFieldEntity extends BaseEntity implements IMedecineField {
  @Column({ name: "code", type: "varchar", length: 50, unique: true })
  code: string;

  @Column({ name: "name", type: "varchar", length: 200 })
  name: string;

  @Column({ name: "color", type: "varchar", length: 20, nullable: true })
  color?: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;
}
