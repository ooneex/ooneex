import type { IMcqQuestion, IMcqQuestionShared } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_shared",
})
export class McqQuestionSharedEntity extends BaseEntity implements IMcqQuestionShared {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "shared_with", type: "varchar", length: 255, nullable: true })
  sharedWith?: string;

  @Column({ name: "shared_by_id", type: "varchar", length: 25, nullable: true })
  sharedById?: string;

  @Column({ name: "permission", type: "varchar", length: 50, nullable: true })
  permission?: string;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: string;
}
