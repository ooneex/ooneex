import type { IFolder, IFolderViewed } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_viewed",
})
export class FolderViewedEntity extends BaseEntity implements IFolderViewed {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "viewed_by", type: "varchar", length: 255, nullable: true })
  viewedBy?: string;

  @Column({ name: "viewed_by_id", type: "varchar", length: 25, nullable: true })
  viewedById?: string;
}
