import type { IFolder, IFolderShared } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_shared",
})
export class FolderSharedEntity extends BaseEntity implements IFolderShared {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "shared_with", type: "varchar", length: 255, nullable: true })
  sharedWith?: string;

  @Column({ name: "shared_by_id", type: "varchar", length: 25, nullable: true })
  sharedById?: string;

  @Column({ name: "permission", type: "varchar", length: 50, nullable: true })
  permission?: string;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: string;
}
