import type { IImage, IImageDownloaded } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_downloaded",
})
export class ImageDownloadedEntity extends BaseEntity implements IImageDownloaded {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "downloaded_by", type: "varchar", length: 255, nullable: true })
  downloadedBy?: string;

  @Column({ name: "downloaded_by_id", type: "varchar", length: 25, nullable: true })
  downloadedById?: string;
}
