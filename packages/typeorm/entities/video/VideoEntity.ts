import type { ICategory } from "@ooneex/category";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import {
  type AudioChannelsType,
  type AudioCodecType,
  EVideoCodec,
  EVideoFormat,
  EVideoQuality,
  EVideoResolution,
  type IVideo,
} from "@ooneex/video";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { CategoryEntity } from "../common/CategoryEntity";
import { StatusEntity } from "../common/StatusEntity";
import { TagEntity } from "../common/TagEntity";

@Entity({
  name: "videos",
})
export class VideoEntity extends BaseEntity implements IVideo {
  @Column({ name: "title", type: "varchar", length: 500 })
  title: string;

  @Column({ name: "subtitle", type: "varchar", length: 500, nullable: true })
  subtitle?: string;

  @Column({ name: "release_date", type: "date", nullable: true })
  releaseDate?: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "duration", type: "int", nullable: true })
  duration?: number;

  @ManyToOne(() => CategoryEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "category_id" })
  category?: ICategory;

  @Column({ name: "genres", type: "json", nullable: true })
  genres?: string[];

  @Column({ name: "size", type: "bigint", nullable: true })
  size?: number;

  @Column({ name: "url", type: "text", nullable: true })
  url?: string;

  @Column({ name: "poster_image", type: "text", nullable: true })
  posterImage?: string;

  @Column({ name: "thumbnail_image", type: "text", nullable: true })
  thumbnailImage?: string;

  @Column({
    name: "resolution",
    type: "enum",
    enum: EVideoResolution,
    nullable: true,
  })
  resolution?: EVideoResolution;

  @Column({
    name: "quality",
    type: "enum",
    enum: EVideoQuality,
    nullable: true,
  })
  quality?: EVideoQuality;

  @Column({
    name: "format",
    type: "enum",
    enum: EVideoFormat,
    nullable: true,
  })
  format?: EVideoFormat;

  @Column({
    name: "codec",
    type: "enum",
    enum: EVideoCodec,
    nullable: true,
  })
  codec?: EVideoCodec;

  @Column({ name: "bitrate", type: "int", nullable: true })
  bitrate?: number;

  @Column({
    name: "frame_rate",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  frameRate?: number;

  @Column({ name: "audio_codec", type: "varchar", length: 50, nullable: true })
  audioCodec?: AudioCodecType;

  @Column({
    name: "audio_channels",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  audioChannels?: AudioChannelsType;

  @Column({
    name: "average_rating",
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: true,
  })
  averageRating?: number;

  @Column({ name: "ratings_count", type: "int", nullable: true })
  ratingsCount?: number;

  @Column({
    name: "content_rating",
    type: "varchar",
    length: 10,
    nullable: true,
  })
  contentRating?: string;

  @Column({ name: "context", type: "varchar", length: 255, nullable: true })
  context?: string;

  @Column({ name: "context_id", type: "varchar", length: 25, nullable: true })
  contextId?: string;

  @Column({ name: "is_youtube", type: "boolean", default: false })
  isYoutube: boolean;

  @ManyToMany(() => TagEntity, { eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "videos_tags",
    joinColumn: { name: "video_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
