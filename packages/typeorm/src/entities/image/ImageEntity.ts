import { type IImage, IMAGE_FORMATS, IMAGE_MIMES, type ImageFormatType, type ImageMimeType } from "@ooneex/image";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { ScalarType } from "@ooneex/types";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { StatusEntity } from "../common/StatusEntity";
import { TagEntity } from "../common/TagEntity";

@Entity({
  name: "images",
})
export class ImageEntity extends BaseEntity implements IImage {
  @Column({ name: "url", type: "varchar", length: 500 })
  url: string;

  @Column({ name: "width", type: "int", nullable: true })
  width?: number;

  @Column({ name: "height", type: "int", nullable: true })
  height?: number;

  @Column({ name: "alt", type: "varchar", length: 255, nullable: true })
  alt?: string;

  @Column({ name: "title", type: "varchar", length: 255, nullable: true })
  title?: string;

  @Column({
    name: "format",
    type: "enum",
    enum: IMAGE_FORMATS,
    nullable: true,
  })
  format?: ImageFormatType;

  @Column({
    name: "mime_type",
    type: "enum",
    enum: IMAGE_MIMES,
    nullable: true,
  })
  mimeType?: ImageMimeType;

  @Column({ name: "size", type: "bigint", nullable: true })
  size?: number;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata?: Record<string, ScalarType>;

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;

  @ManyToMany(() => TagEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "images_tags",
    joinColumn: { name: "image_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];
}
