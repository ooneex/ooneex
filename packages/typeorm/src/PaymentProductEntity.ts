import type { ICategory } from "@ooneex/category";
import type { CurrencyCodeType } from "@ooneex/currencies";
import type { IImage } from "@ooneex/image";
import type { IProduct } from "@ooneex/payment";
import type { ITag } from "@ooneex/tag";
import type { ScalarType } from "@ooneex/types";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { CategoryEntity } from "./CategoryEntity";
import { ImageEntity } from "./ImageEntity";
import { TagEntity } from "./TagEntity";

@Entity({
  name: "payment_products",
})
export class PaymentProductEntity extends BaseEntity implements IProduct {
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToMany(() => CategoryEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "payment_products_categories",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories?: ICategory[];

  @Column({ name: "currency", type: "varchar", length: 3 })
  currency: CurrencyCodeType;

  @Column({ name: "price", type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ name: "barcode", type: "varchar", length: 255, nullable: true })
  barcode?: string;

  @ManyToMany(() => ImageEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "payment_products_images",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "image_id", referencedColumnName: "id" },
  })
  images?: IImage[];

  @Column({ name: "attributes", type: "jsonb", nullable: true })
  attributes?: Record<string, ScalarType>;

  @ManyToMany(() => TagEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "payment_products_tags",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];
}
