import type { IFlashcard, IFlashcardDeck } from "@ooneex/gamification/flashcard";
import { EFlashcardAlgorithm } from "@ooneex/gamification/flashcard";
import type { IStatus } from "@ooneex/status";
import type { IStat } from "@ooneex/types";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";
import { StatEntity } from "../../common/StatEntity";
import { StatusEntity } from "../../common/StatusEntity";
import { FlashcardEntity } from "./FlashcardEntity";

@Entity({
  name: "flashcard_decks",
})
export class FlashcardDeckEntity extends BaseEntity implements IFlashcardDeck {
  @Column({ name: "name", type: "varchar", length: 500 })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "total_cards", type: "int", default: 0 })
  totalCards: number;

  @Column({ name: "new_cards", type: "int", default: 0 })
  newCards: number;

  @Column({ name: "learning_cards", type: "int", default: 0 })
  learningCards: number;

  @Column({ name: "due_cards", type: "int", default: 0 })
  dueCards: number;

  @Column({ name: "suspended_cards", type: "int", default: 0 })
  suspendedCards: number;

  @OneToMany(
    () => FlashcardEntity,
    (card) => card.deck,
    {
      eager: false,
      cascade: ["insert", "update", "remove"],
    },
  )
  cards: IFlashcard[];

  @Column({
    name: "algorithm",
    type: "enum",
    enum: EFlashcardAlgorithm,
    default: EFlashcardAlgorithm.FSRS,
  })
  algorithm: EFlashcardAlgorithm;

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

  @Column({ name: "fsrs_parameters", type: "json", nullable: true })
  fsrsParameters?: number[];

  @Column({ name: "leech_threshold", type: "int", default: 8 })
  leechThreshold: number;

  @Column({ name: "bury_siblings", type: "boolean", default: false })
  burySiblings: boolean;

  @ManyToOne(() => StatEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "stat_id" })
  stat?: IStat;

  @ManyToOne(() => StatusEntity, {
    nullable: true,
    eager: false,
    cascade: ["insert", "update"],
  })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
