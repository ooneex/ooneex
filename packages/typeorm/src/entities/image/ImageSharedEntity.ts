import type { IImage, IImageShared } from "@ooneex/image";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { ImageEntity } from "./ImageEntity";

@Entity({
  name: "images_shared",
})
export class ImageSharedEntity extends BaseEntity implements IImageShared {
  @ManyToOne(() => ImageEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "image_id" })
  image?: IImage;

  @Column({ name: "image_id", type: "varchar", length: 25, nullable: true })
  imageId?: string;

  @Column({ name: "shared_with", type: "varchar", length: 255, nullable: true })
  sharedWith?: string;

  @Column({ name: "shared_by_id", type: "varchar", length: 25, nullable: true })
  sharedById?: string;

  @Column({ name: "permission", type: "varchar", length: 50, nullable: true })
  permission?: string;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: string;
}
