import type { IFlashcard, IFlashcardReview, IFlashcardSession } from "@ooneex/gamification/flashcard";
import { EFlashcardAlgorithm, EFlashcardRating, EFlashcardState } from "@ooneex/gamification/flashcard";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { FlashcardEntity } from "./FlashcardEntity";
import { FlashcardSessionEntity } from "./FlashcardSessionEntity";

@Entity({
  name: "flashcard_reviews",
})
export class FlashcardReviewEntity extends BaseEntity implements IFlashcardReview {
  @ManyToOne(() => FlashcardEntity, {
    nullable: false,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "card_id" })
  card: IFlashcard;

  @ManyToOne(() => FlashcardSessionEntity, {
    nullable: false,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "session_id" })
  session: IFlashcardSession;

  @Column({
    name: "rating",
    type: "enum",
    enum: EFlashcardRating,
  })
  rating: EFlashcardRating;

  @Column({ name: "response_time", type: "int" })
  responseTime: number;

  @Column({ name: "previous_interval", type: "int" })
  previousInterval: number;

  @Column({ name: "new_interval", type: "int" })
  newInterval: number;

  @Column({
    name: "previous_ease_factor",
    type: "decimal",
    precision: 4,
    scale: 2,
  })
  previousEaseFactor: number;

  @Column({
    name: "new_ease_factor",
    type: "decimal",
    precision: 4,
    scale: 2,
  })
  newEaseFactor: number;

  @Column({ name: "previous_due_date", type: "timestamptz" })
  previousDueDate: Date;

  @Column({ name: "new_due_date", type: "timestamptz" })
  newDueDate: Date;

  @Column({
    name: "previous_state",
    type: "enum",
    enum: EFlashcardState,
  })
  previousState: EFlashcardState;

  @Column({
    name: "new_state",
    type: "enum",
    enum: EFlashcardState,
  })
  newState: EFlashcardState;

  @Column({ name: "was_lapse", type: "boolean", default: false })
  wasLapse: boolean;

  @Column({
    name: "algorithm",
    type: "enum",
    enum: EFlashcardAlgorithm,
  })
  algorithm: EFlashcardAlgorithm;

  @Column({ name: "reviewed_at", type: "timestamptz" })
  reviewedAt: Date;
}
