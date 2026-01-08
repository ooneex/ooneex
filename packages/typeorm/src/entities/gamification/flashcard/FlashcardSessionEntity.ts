import type { ILevel } from "@ooneex/gamification";
import { ESessionType } from "@ooneex/gamification";
import type { IFlashcard, IFlashcardReview, IFlashcardSession } from "@ooneex/gamification/flashcard";
import { EFlashcardAlgorithm, EFlashcardSessionStatus } from "@ooneex/gamification/flashcard";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { LevelEntity } from "../LevelEntity";
import { FlashcardEntity } from "./FlashcardEntity";
import { FlashcardReviewEntity } from "./FlashcardReviewEntity";

@Entity({
  name: "flashcard_sessions",
})
export class FlashcardSessionEntity extends BaseEntity implements IFlashcardSession {
  @Column({ name: "name", type: "varchar", length: 500 })
  name: string;

  @Column({ name: "total_cards", type: "int", default: 0 })
  totalCards: number;

  @Column({ name: "new_cards_count", type: "int", default: 0 })
  newCardsCount: number;

  @Column({ name: "learning_cards_count", type: "int", default: 0 })
  learningCardsCount: number;

  @Column({ name: "review_cards_count", type: "int", default: 0 })
  reviewCardsCount: number;

  @Column({ name: "studied_count", type: "int", default: 0 })
  studiedCount: number;

  @Column({ name: "correct_count", type: "int", default: 0 })
  correctCount: number;

  @Column({ name: "incorrect_count", type: "int", default: 0 })
  incorrectCount: number;

  @Column({ name: "study_time", type: "int", default: 0 })
  studyTime: number;

  @ManyToMany(() => FlashcardEntity, {
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinTable({
    name: "flashcard_sessions_cards",
    joinColumn: { name: "session_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "flashcard_id", referencedColumnName: "id" },
  })
  cards: IFlashcard[];

  @OneToMany(() => FlashcardReviewEntity, "session", {
    eager: false,
    cascade: ["insert", "update", "remove"],
  })
  reviews: IFlashcardReview[];

  @Column({
    name: "status",
    type: "enum",
    enum: EFlashcardSessionStatus,
    default: EFlashcardSessionStatus.DRAFT,
  })
  status: EFlashcardSessionStatus;

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

  @Column({
    name: "algorithm",
    type: "enum",
    enum: EFlashcardAlgorithm,
    default: EFlashcardAlgorithm.FSRS,
  })
  algorithm: EFlashcardAlgorithm;

  @Column({ name: "max_new_cards", type: "int", default: 20 })
  maxNewCards: number;

  @Column({ name: "max_review_cards", type: "int", default: 200 })
  maxReviewCards: number;

  @Column({
    name: "desired_retention",
    type: "decimal",
    precision: 4,
    scale: 3,
    default: 0.9,
  })
  desiredRetention: number;

  @Column({ name: "learning_steps", type: "json", default: "[1, 10]" })
  learningSteps: number[];

  @Column({ name: "graduating_interval", type: "int", default: 1 })
  graduatingInterval: number;

  @Column({ name: "easy_interval", type: "int", default: 4 })
  easyInterval: number;

  @Column({ name: "max_interval", type: "int", default: 36500 })
  maxInterval: number;
}
