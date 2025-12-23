import type { IVideo, IVideoProgress } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "video_progress",
})
export class VideoProgressEntity extends BaseEntity implements IVideoProgress {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "user_id", type: "varchar", length: 15 })
  userId: string;

  @Column({ name: "current_time", type: "int" })
  currentTime: number;

  @Column({ name: "duration", type: "int", nullable: true })
  duration?: number;

  @Column({
    name: "completed",
    type: "boolean",
    default: false,
    nullable: true,
  })
  completed?: boolean;

  @Column({ name: "last_watched", type: "timestamptz", nullable: true })
  lastWatched?: string;
}
