import type { IMcqQuestion, IMcqQuestionStat } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_stats",
})
export class McqQuestionStatEntity extends BaseEntity implements IMcqQuestionStat {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "likes_count", type: "int", default: 0, nullable: true })
  likesCount?: number;

  @Column({ name: "dislikes_count", type: "int", default: 0, nullable: true })
  dislikesCount?: number;

  @Column({ name: "comments_count", type: "int", default: 0, nullable: true })
  commentsCount?: number;

  @Column({ name: "shares_count", type: "int", default: 0, nullable: true })
  sharesCount?: number;

  @Column({ name: "saves_count", type: "int", default: 0, nullable: true })
  savesCount?: number;

  @Column({ name: "views_count", type: "int", default: 0, nullable: true })
  viewsCount?: number;

  @Column({ name: "reports_count", type: "int", default: 0, nullable: true })
  reportsCount?: number;
}
