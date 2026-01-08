import type { IMcqQuestion, IMcqQuestionLiked } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_liked",
})
export class McqQuestionLikedEntity extends BaseEntity implements IMcqQuestionLiked {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "liked_by", type: "varchar", length: 255, nullable: true })
  likedBy?: string;

  @Column({ name: "liked_by_id", type: "varchar", length: 25, nullable: true })
  likedById?: string;
}
