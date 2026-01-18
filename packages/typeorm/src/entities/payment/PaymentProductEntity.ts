import type { ICategory } from "@ooneex/category";
import type { CurrencyCodeType } from "@ooneex/currencies";
import type { IImage } from "@ooneex/image";
import type { BenefitType, CustomFieldType, IProduct, PriceType, SubscriptionPeriodType } from "@ooneex/payment";
import type { ITag } from "@ooneex/tag";
import type { ScalarType } from "@ooneex/types";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { CategoryEntity } from "../common/CategoryEntity";
import { TagEntity } from "../common/TagEntity";
import { ImageEntity } from "../image/ImageEntity";

@Entity({
  name: "payment_products",
})
export class PaymentProductEntity extends BaseEntity implements IProduct {
  @Column({ name: "key", type: "varchar", length: 255, nullable: true, unique: true })
  key?: string;

  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToMany(() => CategoryEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_products_categories",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories?: ICategory[];

  @Column({ name: "currency", type: "varchar", length: 3, nullable: true })
  currency?: CurrencyCodeType;

  @Column({
    name: "price",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price?: number;

  @Column({ name: "barcode", type: "varchar", length: 255, nullable: true })
  barcode?: string;

  @ManyToMany(() => ImageEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_products_images",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "image_id", referencedColumnName: "id" },
  })
  images?: IImage[];

  @Column({ name: "attributes", type: "jsonb", nullable: true })
  attributes?: Record<string, ScalarType>;

  @ManyToMany(() => TagEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "payment_products_tags",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];

  @Column({ name: "is_recurring", type: "boolean", nullable: true })
  isRecurring?: boolean;

  @Column({ name: "is_archived", type: "boolean", nullable: true })
  isArchived?: boolean;

  @Column({
    name: "organization_id",
    type: "varchar",
    length: 25,
    nullable: true,
  })
  organizationId?: string;

  @Column({ name: "recurring_interval", type: "varchar", length: 20, nullable: true })
  recurringInterval?: SubscriptionPeriodType;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata?: Record<string, string | number | boolean>;

  @Column({ name: "prices", type: "jsonb", nullable: true })
  prices?: PriceType[];

  @Column({ name: "benefits", type: "jsonb", nullable: true })
  benefits?: BenefitType[];

  @Column({ name: "attached_custom_fields", type: "jsonb", nullable: true })
  attachedCustomFields?: CustomFieldType[];
}
