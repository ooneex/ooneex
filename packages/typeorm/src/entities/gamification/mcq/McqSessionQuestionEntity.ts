import type { IMcqQuestion, IMcqQuestionChoice, IMcqSession, IMcqSessionQuestion } from "@ooneex/gamification";
import { EAnswerState } from "@ooneex/gamification";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionChoiceEntity } from "./McqQuestionChoiceEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";
import { McqSessionEntity } from "./McqSessionEntity";

@Entity({
  name: "mcq_session_questions",
})
export class McqSessionQuestionEntity extends BaseEntity implements IMcqSessionQuestion {
  @ManyToOne(() => McqSessionEntity, {
    nullable: false,
    eager: false,
    cascade: ["remove", "soft-remove"],
  })
  @JoinColumn({ name: "session_id" })
  session: IMcqSession;

  @ManyToOne(() => McqQuestionEntity, {
    nullable: false,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "question_id" })
  question: IMcqQuestion;

  @Column({ name: "question_number", type: "int" })
  questionNumber: number;

  @ManyToMany(() => McqQuestionChoiceEntity, {
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "mcq_session_questions_selected_choices",
    joinColumn: { name: "session_question_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "choice_id", referencedColumnName: "id" },
  })
  selectedChoices: IMcqQuestionChoice[];

  @Column({ name: "context", type: "varchar", length: 255, nullable: true })
  context?: string;

  @Column({ name: "context_id", type: "varchar", length: 25, nullable: true })
  contextId?: string;

  @Column({
    name: "state",
    type: "enum",
    enum: EAnswerState,
  })
  state: EAnswerState;

  @Column({
    name: "score",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  score: number;
}
