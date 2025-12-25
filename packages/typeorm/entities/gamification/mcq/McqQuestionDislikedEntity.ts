import type { IMcqQuestion, IMcqQuestionDisliked } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_disliked",
})
export class McqQuestionDislikedEntity extends BaseEntity implements IMcqQuestionDisliked {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "disliked_by", type: "varchar", length: 255, nullable: true })
  dislikedBy?: string;

  @Column({ name: "disliked_by_id", type: "varchar", length: 25, nullable: true })
  dislikedById?: string;
}
