import type { IStat } from "@ooneex/types";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity("stats")
export class StatEntity extends BaseEntity implements IStat {
  @Column({
    name: "comments_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  commentsCount = 0;

  @Column({
    name: "likes_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  likesCount = 0;

  @Column({
    name: "dislikes_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  dislikesCount = 0;

  @Column({
    name: "shares_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  sharesCount = 0;

  @Column({
    name: "views_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  viewsCount = 0;

  @Column({
    name: "downloads_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  downloadsCount = 0;

  @Column({
    name: "saves_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  savesCount = 0;

  @Column({
    name: "bookmarks_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  bookmarksCount = 0;

  @Column({
    name: "reposts_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  repostsCount = 0;

  @Column({
    name: "impressions_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  impressionsCount = 0;

  @Column({
    name: "clicks_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  clicksCount = 0;

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
    name: "followers_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  followersCount = 0;

  @Column({
    name: "following_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  followingCount = 0;

  @Column({
    name: "blocked_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  blockedCount = 0;

  @Column({
    name: "reports_count",
    type: "int",
    default: 0,
    nullable: false,
  })
  reportsCount = 0;
}
