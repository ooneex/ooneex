import type { IFolder, IFolderReport } from "@ooneex/folder";
import type { IStatus } from "@ooneex/status";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { StatusEntity } from "../common/StatusEntity";
import { FolderEntity } from "./FolderEntity";

@Entity({
  name: "folders_reports",
})
export class FolderReportEntity extends BaseEntity implements IFolderReport {
  @ManyToOne(() => FolderEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "folder_id" })
  folder?: IFolder;

  @Column({ name: "folder_id", type: "varchar", length: 25, nullable: true })
  folderId?: string;

  @Column({ name: "reason", type: "varchar", length: 255 })
  reason: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "reported_by", type: "varchar", length: 255, nullable: true })
  reportedBy?: string;

  @Column({ name: "reported_by_id", type: "varchar", length: 25, nullable: true })
  reportedById?: string;

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
