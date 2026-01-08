import type { IFlashcardSchedule } from "@ooneex/gamification/flashcard";
import { EFlashcardState } from "@ooneex/gamification/flashcard";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";

@Entity({
  name: "flashcard_schedules",
})
export class FlashcardScheduleEntity extends BaseEntity implements IFlashcardSchedule {
  @Column({
    name: "state",
    type: "enum",
    enum: EFlashcardState,
    default: EFlashcardState.NEW,
  })
  state: EFlashcardState;

  @Column({ name: "interval", type: "int", default: 0 })
  interval: number;

  @Column({
    name: "ease_factor",
    type: "decimal",
    precision: 4,
    scale: 2,
    default: 2.5,
  })
  easeFactor: number;

  @Column({ name: "review_count", type: "int", default: 0 })
  reviewCount: number;

  @Column({ name: "lapse_count", type: "int", default: 0 })
  lapseCount: number;

  @Column({ name: "current_step", type: "int", default: 0 })
  currentStep: number;

  @Column({ name: "due_date", type: "timestamptz" })
  dueDate: Date;

  @Column({ name: "last_reviewed_at", type: "timestamptz", nullable: true })
  lastReviewedAt?: Date | null;

  @Column({
    name: "difficulty",
    type: "decimal",
    precision: 4,
    scale: 2,
    nullable: true,
  })
  difficulty?: number;

  @Column({
    name: "stability",
    type: "decimal",
    precision: 10,
    scale: 4,
    nullable: true,
  })
  stability?: number;

  @Column({
    name: "retrievability",
    type: "decimal",
    precision: 4,
    scale: 3,
    nullable: true,
  })
  retrievability?: number;

  @Column({ name: "learning_steps", type: "json", default: "[]" })
  learningSteps: number[];

  @Column({ name: "relearning_steps", type: "json", default: "[]" })
  relearningSteps: number[];
}
