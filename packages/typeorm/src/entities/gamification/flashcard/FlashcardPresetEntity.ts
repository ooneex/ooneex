import type { IFlashcardPreset } from "@ooneex/gamification/flashcard";
import { EFlashcardAlgorithm } from "@ooneex/gamification/flashcard";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";

@Entity({
  name: "flashcard_presets",
})
export class FlashcardPresetEntity extends BaseEntity implements IFlashcardPreset {
  @Column({ name: "name", type: "varchar", length: 500 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({
    name: "algorithm",
    type: "enum",
    enum: EFlashcardAlgorithm,
    default: EFlashcardAlgorithm.FSRS,
  })
  algorithm: EFlashcardAlgorithm;

  @Column({ name: "learning_steps", type: "json", default: "[1, 10]" })
  learningSteps: number[];

  @Column({ name: "relearning_steps", type: "json", default: "[10]" })
  relearningSteps: number[];

  @Column({ name: "graduating_interval", type: "int", default: 1 })
  graduatingInterval: number;

  @Column({ name: "easy_interval", type: "int", default: 4 })
  easyInterval: number;

  @Column({ name: "max_interval", type: "int", default: 36500 })
  maxInterval: number;

  @Column({ name: "max_new_cards_per_day", type: "int", default: 20 })
  maxNewCardsPerDay: number;

  @Column({ name: "max_review_cards_per_day", type: "int", default: 200 })
  maxReviewCardsPerDay: number;

  @Column({
    name: "desired_retention",
    type: "decimal",
    precision: 4,
    scale: 3,
    default: 0.9,
  })
  desiredRetention: number;

  @Column({ name: "fsrs_parameters", type: "json", nullable: true })
  fsrsParameters?: number[];

  @Column({
    name: "starting_ease_factor",
    type: "decimal",
    precision: 4,
    scale: 2,
    default: 2.5,
  })
  startingEaseFactor: number;

  @Column({
    name: "easy_bonus",
    type: "decimal",
    precision: 4,
    scale: 2,
    default: 1.3,
  })
  easyBonus: number;

  @Column({
    name: "interval_modifier",
    type: "decimal",
    precision: 4,
    scale: 2,
    default: 1.0,
  })
  intervalModifier: number;

  @Column({
    name: "hard_interval",
    type: "decimal",
    precision: 4,
    scale: 2,
    default: 1.2,
  })
  hardInterval: number;

  @Column({
    name: "new_interval",
    type: "decimal",
    precision: 4,
    scale: 2,
    default: 0.0,
  })
  newInterval: number;

  @Column({ name: "minimum_interval", type: "int", default: 1 })
  minimumInterval: number;

  @Column({ name: "leech_threshold", type: "int", default: 8 })
  leechThreshold: number;

  @Column({ name: "bury_siblings", type: "boolean", default: false })
  burySiblings: boolean;

  @Column({ name: "show_timer", type: "boolean", default: false })
  showTimer: boolean;

  @Column({ name: "auto_play_audio", type: "boolean", default: true })
  autoPlayAudio: boolean;
}
