import type { ICoupon, ICredit, IPlan, ISubscription } from "@ooneex/payment";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { PaymentCouponEntity } from "./PaymentCouponEntity";
import { PaymentCreditEntity } from "./PaymentCreditEntity";
import { PaymentPlanEntity } from "./PaymentPlanEntity";

@Entity({
  name: "payment_subscriptions",
})
export class PaymentSubscriptionEntity extends BaseEntity implements Omit<ISubscription, "isActive"> {
  @ManyToMany(() => PaymentCouponEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_subscriptions_coupons",
    joinColumn: { name: "subscription_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "coupon_id", referencedColumnName: "id" },
  })
  coupons?: ICoupon[];

  @ManyToMany(() => PaymentPlanEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_subscriptions_plans",
    joinColumn: { name: "subscription_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "plan_id", referencedColumnName: "id" },
  })
  plans?: IPlan[];

  @ManyToMany(() => PaymentCreditEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_subscriptions_credits",
    joinColumn: { name: "subscription_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "credit_id", referencedColumnName: "id" },
  })
  credits?: ICredit[];

  @Column({ name: "start_at", type: "timestamptz" })
  startAt: Date;

  @Column({ name: "end_at", type: "timestamptz", nullable: true })
  endAt?: Date;

  @Column({ name: "is_trial", type: "boolean", default: false, nullable: true })
  isTrial?: boolean;

  @Column({ name: "is_active", type: "boolean", default: true, nullable: true })
  isActive?: boolean;
}
