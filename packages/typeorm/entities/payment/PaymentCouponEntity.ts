import type { CurrencyCodeType } from "@ooneex/currencies";
import { EDiscountType, type ICoupon, type IPlan, type IProduct } from "@ooneex/payment";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { PaymentPlanEntity } from "./PaymentPlanEntity";
import { PaymentProductEntity } from "./PaymentProductEntity";

@Entity({
  name: "payment_coupons",
})
export class PaymentCouponEntity extends BaseEntity implements ICoupon {
  @Column({ name: "code", type: "varchar", length: 50, unique: true })
  code: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: true })
  name?: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({
    name: "discount_type",
    type: "enum",
    enum: EDiscountType,
  })
  discountType: EDiscountType;

  @Column({ name: "discount_value", type: "decimal", precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: "currency", type: "varchar", length: 3, nullable: true })
  currency?: CurrencyCodeType;

  @Column({ name: "max_uses", type: "int", nullable: true })
  maxUses?: number;

  @Column({ name: "used_count", type: "int", default: 0, nullable: true })
  usedCount?: number;

  @Column({ name: "start_at", type: "timestamptz", nullable: true })
  startAt?: Date;

  @Column({ name: "end_at", type: "timestamptz", nullable: true })
  endAt?: Date;

  @Column({ name: "is_active", type: "boolean", default: true, nullable: true })
  isActive?: boolean;

  @Column({
    name: "minimum_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minimumAmount?: number;

  @ManyToMany(() => PaymentProductEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_coupons_applicable_products",
    joinColumn: { name: "coupon_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
  })
  applicableProducts?: IProduct[];

  @ManyToMany(() => PaymentPlanEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_coupons_applicable_plans",
    joinColumn: { name: "coupon_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "plan_id", referencedColumnName: "id" },
  })
  applicablePlans?: IPlan[];
}
