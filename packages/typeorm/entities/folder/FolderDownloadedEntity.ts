import type { IFolder, IFolderDownloaded } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_downloaded",
})
export class FolderDownloadedEntity extends BaseEntity implements IFolderDownloaded {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "downloaded_by", type: "varchar", length: 255, nullable: true })
  downloadedBy?: string;

  @Column({ name: "downloaded_by_id", type: "varchar", length: 25, nullable: true })
  downloadedById?: string;
}
