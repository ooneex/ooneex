import type { CurrencyCodeType } from "@ooneex/currencies";
import {
  type DiscountDurationType,
  type DiscountType,
  EDiscountDuration,
  EDiscountType,
  type IDiscount,
  type IPlan,
  type IProduct,
} from "@ooneex/payment";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { PaymentPlanEntity } from "./PaymentPlanEntity";
import { PaymentProductEntity } from "./PaymentProductEntity";

@Entity({
  name: "payment_discounts",
})
export class PaymentDiscountEntity extends BaseEntity implements IDiscount {
  @Column({ name: "key", type: "varchar", length: 255, nullable: true, unique: true })
  key?: string;

  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "code", type: "varchar", length: 50, nullable: true, unique: true })
  code?: string;

  @Column({
    name: "type",
    type: "enum",
    enum: EDiscountType,
  })
  type: DiscountType;

  @Column({ name: "amount", type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ name: "currency", type: "varchar", length: 3, nullable: true })
  currency?: CurrencyCodeType;

  @Column({
    name: "duration",
    type: "enum",
    enum: EDiscountDuration,
  })
  duration: DiscountDurationType;

  @Column({ name: "duration_in_months", type: "int", nullable: true })
  durationInMonths?: number;

  @Column({ name: "start_at", type: "timestamptz", nullable: true })
  startAt?: Date;

  @Column({ name: "end_at", type: "timestamptz", nullable: true })
  endAt?: Date;

  @Column({ name: "max_uses", type: "int", nullable: true })
  maxUses?: number;

  @Column({ name: "used_count", type: "int", default: 0, nullable: true })
  usedCount?: number;

  @Column({ name: "max_redemptions", type: "int", nullable: true })
  maxRedemptions?: number;

  @Column({ name: "redemptions_count", type: "int", default: 0, nullable: true })
  redemptionsCount?: number;

  @Column({ name: "is_active", type: "boolean", default: true, nullable: true })
  isActive?: boolean;

  @Column({ name: "minimum_amount", type: "decimal", precision: 10, scale: 2, nullable: true })
  minimumAmount?: number;

  @ManyToMany(() => PaymentProductEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_discounts_applicable_products",
    joinColumn: { name: "discount_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
  })
  applicableProducts?: IProduct[];

  @ManyToMany(() => PaymentPlanEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_discounts_applicable_plans",
    joinColumn: { name: "discount_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "plan_id", referencedColumnName: "id" },
  })
  applicablePlans?: IPlan[];

  @Column({
    name: "organization_id",
    type: "varchar",
    length: 25,
    nullable: true,
  })
  organizationId?: string;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata?: Record<string, string | number | boolean>;
}
