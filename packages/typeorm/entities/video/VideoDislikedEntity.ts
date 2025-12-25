import type { IVideo, IVideoDisliked } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_disliked",
})
export class VideoDislikedEntity extends BaseEntity implements IVideoDisliked {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "disliked_by", type: "varchar", length: 255, nullable: true })
  dislikedBy?: string;

  @Column({ name: "disliked_by_id", type: "varchar", length: 25, nullable: true })
  dislikedById?: string;
}
