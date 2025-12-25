import type { IFolder, IFolderLiked } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_liked",
})
export class FolderLikedEntity extends BaseEntity implements IFolderLiked {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "liked_by", type: "varchar", length: 255, nullable: true })
  likedBy?: string;

  @Column({ name: "liked_by_id", type: "varchar", length: 25, nullable: true })
  likedById?: string;
}
