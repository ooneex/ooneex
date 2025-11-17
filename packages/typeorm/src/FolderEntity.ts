import type { IColor } from "@ooneex/color";
import type { IFolder } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { ColorEntity } from "./ColorEntity";

@Entity({
  name: "folders",
})
export class FolderEntity extends BaseEntity implements IFolder {
  @Column({ name: "name", type: "varchar", length: 100 })
  name: string;

  @ManyToOne(() => ColorEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinColumn({ name: "color_id" })
  color?: IColor;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => FolderEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "parent_id" })
  parent?: IFolder;

  @OneToMany(
    () => FolderEntity,
    (folder) => folder.parent,
  )
  children?: IFolder[];
}
