import type { ICountry } from "@ooneex/country";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "countries",
})
export class CountryEntity extends BaseEntity implements ICountry {
  @Column({ name: "name", type: "varchar", length: 100 })
  name: string;

  @Column({ name: "code", type: "varchar", length: 10, unique: true })
  code: string;
}
