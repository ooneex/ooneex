import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IPlaylist, IVideo } from "@ooneex/video";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { StatusEntity } from "./StatusEntity";
import { TagEntity } from "./TagEntity";
import { VideoEntity } from "./VideoEntity";

@Entity({
  name: "video_playlists",
})
export class VideoPlaylistEntity extends BaseEntity implements IPlaylist {
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ManyToMany(() => VideoEntity, { eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "playlists_videos",
    joinColumn: { name: "playlist_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "video_id", referencedColumnName: "id" },
  })
  videos?: IVideo[];

  @ManyToMany(() => TagEntity, { eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "playlists_tags",
    joinColumn: { name: "playlist_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];

  @ManyToOne(() => StatusEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
