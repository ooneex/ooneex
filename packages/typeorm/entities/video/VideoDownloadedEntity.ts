import type { IVideo, IVideoDownloaded } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_downloaded",
})
export class VideoDownloadedEntity extends BaseEntity implements IVideoDownloaded {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "downloaded_by", type: "varchar", length: 255, nullable: true })
  downloadedBy?: string;

  @Column({ name: "downloaded_by_id", type: "varchar", length: 25, nullable: true })
  downloadedById?: string;
}
