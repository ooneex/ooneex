import type { IVideo, IVideoLiked } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_liked",
})
export class VideoLikedEntity extends BaseEntity implements IVideoLiked {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "liked_by", type: "varchar", length: 255, nullable: true })
  likedBy?: string;

  @Column({ name: "liked_by_id", type: "varchar", length: 25, nullable: true })
  likedById?: string;
}
