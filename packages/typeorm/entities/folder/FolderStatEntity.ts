import type { IFolder, IFolderStat } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_stats",
})
export class FolderStatEntity extends BaseEntity implements IFolderStat {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "likes_count", type: "int", default: 0, nullable: true })
  likesCount?: number;

  @Column({ name: "dislikes_count", type: "int", default: 0, nullable: true })
  dislikesCount?: number;

  @Column({ name: "comments_count", type: "int", default: 0, nullable: true })
  commentsCount?: number;

  @Column({ name: "shares_count", type: "int", default: 0, nullable: true })
  sharesCount?: number;

  @Column({ name: "saves_count", type: "int", default: 0, nullable: true })
  savesCount?: number;

  @Column({ name: "downloads_count", type: "int", default: 0, nullable: true })
  downloadsCount?: number;

  @Column({ name: "views_count", type: "int", default: 0, nullable: true })
  viewsCount?: number;

  @Column({ name: "reports_count", type: "int", default: 0, nullable: true })
  reportsCount?: number;
}
