import type { IImage, IImageStat } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_stats",
})
export class ImageStatEntity extends BaseEntity implements IImageStat {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "likes_count", type: "int", default: 0, nullable: true })
  likesCount?: number;

  @Column({ name: "dislikes_count", type: "int", default: 0, nullable: true })
  dislikesCount?: number;

  @Column({ name: "comments_count", type: "int", default: 0, nullable: true })
  commentsCount?: number;

  @Column({ name: "shares_count", type: "int", default: 0, nullable: true })
  sharesCount?: number;

  @Column({ name: "saves_count", type: "int", default: 0, nullable: true })
  savesCount?: number;

  @Column({ name: "downloads_count", type: "int", default: 0, nullable: true })
  downloadsCount?: number;

  @Column({ name: "views_count", type: "int", default: 0, nullable: true })
  viewsCount?: number;

  @Column({ name: "reports_count", type: "int", default: 0, nullable: true })
  reportsCount?: number;
}
