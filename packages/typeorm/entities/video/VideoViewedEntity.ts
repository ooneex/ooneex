import type { IVideo, IVideoViewed } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_viewed",
})
export class VideoViewedEntity extends BaseEntity implements IVideoViewed {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "viewed_by", type: "varchar", length: 255, nullable: true })
  viewedBy?: string;

  @Column({ name: "viewed_by_id", type: "varchar", length: 25, nullable: true })
  viewedById?: string;
}
