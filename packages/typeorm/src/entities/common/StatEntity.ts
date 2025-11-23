import type { IStat } from "@ooneex/types";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("stats")
export class StatEntity extends BaseEntity implements IStat {
  @Column({
    name: "comment_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  commentCount = 0;

  @Column({
    name: "like_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  likeCount = 0;

  @Column({
    name: "share_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  shareCount = 0;

  @Column({
    name: "view_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  viewCount = 0;

  @Column({
    name: "download_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  downloadCount = 0;

  @Column({
    name: "bookmark_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  bookmarkCount = 0;

  @Column({
    name: "repost_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  repostCount = 0;

  @Column({
    name: "impression_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  impressionCount = 0;

  @Column({
    name: "click_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  clickCount = 0;

  @Column({
    name: "engagement_rate",
    type: "decimal",
    precision: 5,
    scale: 4,
    default: 0,
    nullable: false,
  })
  engagementRate = 0;

  @Column({
    name: "reach",
    type: "int",
    default: 0,
    nullable: false,
  })
  reach = 0;

  @Column({
    name: "follower_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  followerCount = 0;

  @Column({
    name: "following_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  followingCount = 0;
}
