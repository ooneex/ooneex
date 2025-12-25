import type { IVideo, IVideoShared } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_shared",
})
export class VideoSharedEntity extends BaseEntity implements IVideoShared {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "shared_with", type: "varchar", length: 255, nullable: true })
  sharedWith?: string;

  @Column({ name: "shared_by_id", type: "varchar", length: 25, nullable: true })
  sharedById?: string;

  @Column({ name: "permission", type: "varchar", length: 50, nullable: true })
  permission?: string;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: string;
}
