import type { ICategory } from "@ooneex/category";
import type { IColor } from "@ooneex/color";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { ColorEntity } from "./ColorEntity";

@Entity({
  name: "categories",
})
export class CategoryEntity extends BaseEntity implements ICategory {
  @Column({ name: "name", type: "varchar", length: 100 })
  name: string;

  @ManyToOne(() => ColorEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "color_id" })
  color?: IColor;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => CategoryEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "parent_id" })
  parent?: ICategory;

  @OneToMany(
    () => CategoryEntity,
    (category) => category.parent,
  )
  children?: ICategory[];
}
