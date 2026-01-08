import type { IFolder, IFolderSaved } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_saved",
})
export class FolderSavedEntity extends BaseEntity implements IFolderSaved {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "saved_by", type: "varchar", length: 255, nullable: true })
  savedBy?: string;

  @Column({ name: "saved_by_id", type: "varchar", length: 25, nullable: true })
  savedById?: string;
}
