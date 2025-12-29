import type { ICurrency } from "@ooneex/currencies";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";

@Entity({
  name: "currencies",
})
export class CurrencyEntity extends BaseEntity implements ICurrency {
  @Column({ name: "code", type: "varchar", length: 10, unique: true })
  code: string;

  @Column({ name: "name", type: "varchar", length: 100 })
  name: string;

  @Column({ name: "icon", type: "varchar", length: 20, nullable: true })
  icon?: string;

  @Column({ name: "symbol", type: "varchar", length: 20 })
  symbol: string;
}
