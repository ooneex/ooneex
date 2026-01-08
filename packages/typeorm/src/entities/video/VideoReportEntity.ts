import type { IStatus } from "@ooneex/status";
import type { IVideo, IVideoReport } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { StatusEntity } from "../common/StatusEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_reports",
})
export class VideoReportEntity extends BaseEntity implements IVideoReport {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

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
