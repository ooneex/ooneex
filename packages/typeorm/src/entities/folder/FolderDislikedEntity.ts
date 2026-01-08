import type { IFolder, IFolderDisliked } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_disliked",
})
export class FolderDislikedEntity extends BaseEntity implements IFolderDisliked {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "disliked_by", type: "varchar", length: 255, nullable: true })
  dislikedBy?: string;

  @Column({ name: "disliked_by_id", type: "varchar", length: 25, nullable: true })
  dislikedById?: string;
}
