import type { IMcqQuestion, IMcqQuestionComment } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_comments",
})
export class McqQuestionCommentEntity extends BaseEntity implements IMcqQuestionComment {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "comment", type: "text" })
  comment: string;

  @Column({ name: "commented_by", type: "varchar", length: 255, nullable: true })
  commentedBy?: string;

  @Column({ name: "commented_by_id", type: "varchar", length: 25, nullable: true })
  commentedById?: string;

  @Column({ name: "parent_comment_id", type: "varchar", length: 25, nullable: true })
  parentCommentId?: string;
}
