import type { ILevel } from "@ooneex/gamification";
import { ESessionType } from "@ooneex/gamification";
import type { IMcqQuestion, IMcqSession } from "@ooneex/gamification/mcq";
import { EMcqSessionStatus } from "@ooneex/gamification/mcq";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { LevelEntity } from "../LevelEntity";
import { McqQuestionEntity } from "./McqQuestionEntity";

@Entity({
  name: "mcq_sessions",
})
export class McqSessionEntity extends BaseEntity implements IMcqSession {
  @Column({ name: "name", type: "varchar", length: 500 })
  name: string;

  @Column({ name: "total_questions", type: "int", default: 0 })
  totalQuestions: number;

  @Column({ name: "answered_count", type: "int", default: 0 })
  answeredCount: number;

  @Column({ name: "correct_count", type: "int", default: 0 })
  correctCount: number;

  @Column({ name: "incorrect_count", type: "int", default: 0 })
  incorrectCount: number;

  @Column({ name: "timing", type: "int", default: 0 })
  timing: number;

  @ManyToMany(() => McqQuestionEntity, {
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "mcq_sessions_questions",
    joinColumn: { name: "session_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "question_id", referencedColumnName: "id" },
  })
  questions: IMcqQuestion[];

  @Column({
    name: "status",
    type: "enum",
    enum: EMcqSessionStatus,
    default: EMcqSessionStatus.DRAFT,
  })
  status: EMcqSessionStatus;

  @Column({
    name: "score",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  score: number;

  @Column({ name: "started_at", type: "timestamptz", nullable: true })
  startedAt?: Date | null;

  @Column({ name: "paused_at", type: "timestamptz", nullable: true })
  pausedAt?: Date | null;

  @Column({ name: "resumed_at", type: "timestamptz", nullable: true })
  resumedAt?: Date | null;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt?: Date | null;

  @Column({
    name: "type",
    type: "enum",
    enum: ESessionType,
  })
  type: ESessionType;

  @ManyToOne(() => LevelEntity, {
    nullable: false,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "level_id" })
  level: ILevel;
}
