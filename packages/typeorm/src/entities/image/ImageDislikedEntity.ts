import type { IImage, IImageDisliked } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_disliked",
})
export class ImageDislikedEntity extends BaseEntity implements IImageDisliked {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "disliked_by", type: "varchar", length: 255, nullable: true })
  dislikedBy?: string;

  @Column({ name: "disliked_by_id", type: "varchar", length: 25, nullable: true })
  dislikedById?: string;
}
