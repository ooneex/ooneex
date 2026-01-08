import type { IMcqQuestion, IMcqQuestionReport } from "@ooneex/gamification/mcq";
import type { IStatus } from "@ooneex/status";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { StatusEntity } from "../../common/StatusEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_questions_reports",
})
export class McqQuestionReportEntity extends BaseEntity implements IMcqQuestionReport {
  @ManyToOne(() => McqQuestionEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "question_id" })
  question?: IMcqQuestion;

  @Column({ name: "question_id", type: "varchar", length: 25, nullable: true })
  questionId?: string;

  @Column({ name: "reason", type: "varchar", length: 255 })
  reason: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "reported_by", type: "varchar", length: 255, nullable: true })
  reportedBy?: string;

  @Column({ name: "reported_by_id", type: "varchar", length: 25, nullable: true })
  reportedById?: string;

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
