import type { CurrencyCodeType } from "@ooneex/currencies";
import type { IFeature, IPlan } from "@ooneex/payment";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { PaymentFeatureEntity } from "./PaymentFeatureEntity";

@Entity({
  name: "payment_plans",
})
export class PaymentPlanEntity extends BaseEntity implements IPlan {
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "currency", type: "varchar", length: 3 })
  currency: CurrencyCodeType;

  @Column({ name: "price", type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({
    name: "period",
    type: "enum",
    enum: ["monthly", "yearly", "weekly", "daily"],
  })
  period: "monthly" | "yearly" | "weekly" | "daily";

  @Column({ name: "period_count", type: "int", default: 1, nullable: true })
  periodCount?: number;

  @ManyToMany(() => PaymentFeatureEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_plans_features",
    joinColumn: { name: "plan_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "feature_id", referencedColumnName: "id" },
  })
  features?: IFeature[];

  @Column({ name: "is_active", type: "boolean", default: true, nullable: true })
  isActive?: boolean;

  @Column({ name: "trial_days", type: "int", default: 0, nullable: true })
  trialDays?: number;
}
