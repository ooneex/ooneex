import type { IVideo, IVideoSaved } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_saved",
})
export class VideoSavedEntity extends BaseEntity implements IVideoSaved {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "saved_by", type: "varchar", length: 255, nullable: true })
  savedBy?: string;

  @Column({ name: "saved_by_id", type: "varchar", length: 25, nullable: true })
  savedById?: string;
}
