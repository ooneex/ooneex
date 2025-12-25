import type { IImage, IImageLiked } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_liked",
})
export class ImageLikedEntity extends BaseEntity implements IImageLiked {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "liked_by", type: "varchar", length: 255, nullable: true })
  likedBy?: string;

  @Column({ name: "liked_by_id", type: "varchar", length: 25, nullable: true })
  likedById?: string;
}
