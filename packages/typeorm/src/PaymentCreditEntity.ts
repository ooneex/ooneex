import type { CurrencyCodeType } from "@ooneex/currencies";
import type { ICredit } from "@ooneex/payment";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({
  name: "payment_credits",
})
export class PaymentCreditEntity extends BaseEntity implements ICredit {
  @Column({ name: "balance", type: "decimal", precision: 10, scale: 2 })
  balance: number;

  @Column({ name: "currency", type: "varchar", length: 3, nullable: true })
  currency?: CurrencyCodeType;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: Date;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;
}
