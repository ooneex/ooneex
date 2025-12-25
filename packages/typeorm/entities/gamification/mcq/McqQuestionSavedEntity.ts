import type { IMcqQuestion, IMcqQuestionSaved } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_saved",
})
export class McqQuestionSavedEntity extends BaseEntity implements IMcqQuestionSaved {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "saved_by", type: "varchar", length: 255, nullable: true })
  savedBy?: string;

  @Column({ name: "saved_by_id", type: "varchar", length: 25, nullable: true })
  savedById?: string;
}
