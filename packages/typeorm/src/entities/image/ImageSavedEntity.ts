import type { IImage, IImageSaved } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_saved",
})
export class ImageSavedEntity extends BaseEntity implements IImageSaved {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "saved_by", type: "varchar", length: 255, nullable: true })
  savedBy?: string;

  @Column({ name: "saved_by_id", type: "varchar", length: 25, nullable: true })
  savedById?: string;
}
