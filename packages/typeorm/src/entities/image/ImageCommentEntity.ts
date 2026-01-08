import type { IImage, IImageComment } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_comments",
})
export class ImageCommentEntity extends BaseEntity implements IImageComment {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "comment", type: "text" })
  comment: string;

  @Column({ name: "commented_by", type: "varchar", length: 255, nullable: true })
  commentedBy?: string;

  @Column({ name: "commented_by_id", type: "varchar", length: 25, nullable: true })
  commentedById?: string;

  @Column({ name: "parent_comment_id", type: "varchar", length: 25, nullable: true })
  parentCommentId?: string;
}
