import type { IMcqQuestion, IMcqQuestionChoice } from "@ooneex/gamification/mcq";
import { EMcqQuestionChoiceLetter } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_question_choices",
})
export class McqQuestionChoiceEntity extends BaseEntity implements IMcqQuestionChoice {
  @Column({
    name: "letter",
    type: "enum",
    enum: EMcqQuestionChoiceLetter,
  })
  letter: EMcqQuestionChoiceLetter;

  @Column({ name: "text", type: "text" })
  text: string;

  @Column({ name: "is_correct", type: "boolean", default: false })
  isCorrect: boolean;

  @Column({ name: "explanation", type: "text", nullable: true })
  explanation?: string;

  @ManyToOne(() => McqQuestionEntity, {
    nullable: false,
    eager: false,
    cascade: ["remove", "soft-remove"],
  })
  @JoinColumn({ name: "question_id" })
  question: IMcqQuestion;
}
