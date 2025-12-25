import type { IMcqQuestion, IMcqQuestionViewed } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_viewed",
})
export class McqQuestionViewedEntity extends BaseEntity implements IMcqQuestionViewed {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "viewed_by", type: "varchar", length: 255, nullable: true })
  viewedBy?: string;

  @Column({ name: "viewed_by_id", type: "varchar", length: 25, nullable: true })
  viewedById?: string;
}
