import type { IVideo, IVideoStat } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_stats",
})
export class VideoStatEntity extends BaseEntity implements IVideoStat {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

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
