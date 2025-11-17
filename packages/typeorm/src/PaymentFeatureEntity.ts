import type { IFeature } from "@ooneex/payment";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({
  name: "payment_features",
})
export class PaymentFeatureEntity extends BaseEntity implements IFeature {
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "is_enabled", type: "boolean", default: true, nullable: true })
  isEnabled?: boolean;

  @Column({ name: "limit", type: "int", nullable: true })
  limit?: number;
}
