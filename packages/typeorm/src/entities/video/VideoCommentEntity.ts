import type { IVideo, IVideoComment } from "@ooneex/video";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "videos_comments",
})
export class VideoCommentEntity extends BaseEntity implements IVideoComment {
  @ManyToOne(() => VideoEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "video_id" })
  video?: IVideo;

  @Column({ name: "video_id", type: "varchar", length: 25, nullable: true })
  videoId?: string;

  @Column({ name: "comment", type: "text" })
  comment: string;

  @Column({ name: "commented_by", type: "varchar", length: 255, nullable: true })
  commentedBy?: string;

  @Column({ name: "commented_by_id", type: "varchar", length: 25, nullable: true })
  commentedById?: string;

  @Column({ name: "parent_comment_id", type: "varchar", length: 25, nullable: true })
  parentCommentId?: string;
}
