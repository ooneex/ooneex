import type { ICredit, IDiscount, IPlan, ISubscription } from "@ooneex/payment";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { PaymentCreditEntity } from "./PaymentCreditEntity";
import { PaymentDiscountEntity } from "./PaymentDiscountEntity";
import { PaymentPlanEntity } from "./PaymentPlanEntity";

@Entity({
  name: "payment_subscriptions",
})
export class PaymentSubscriptionEntity extends BaseEntity implements Omit<ISubscription, "isActive"> {
  @ManyToMany(() => PaymentDiscountEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_subscriptions_discounts",
    joinColumn: { name: "subscription_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "discount_id", referencedColumnName: "id" },
  })
  discounts?: IDiscount[];

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
