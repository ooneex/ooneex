import type { IFolder, IFolderComment } from "@ooneex/folder";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_comments",
})
export class FolderCommentEntity extends BaseEntity implements IFolderComment {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "comment", type: "text" })
  comment: string;

  @Column({ name: "commented_by", type: "varchar", length: 255, nullable: true })
  commentedBy?: string;

  @Column({ name: "commented_by_id", type: "varchar", length: 25, nullable: true })
  commentedById?: string;

  @Column({ name: "parent_comment_id", type: "varchar", length: 25, nullable: true })
  parentCommentId?: string;
}
