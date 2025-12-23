import type { IFlashcardStats } from "@ooneex/gamification/flashcard";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/BaseEntity";

@Entity({
  name: "flashcard_stats",
})
export class FlashcardStatsEntity extends BaseEntity implements IFlashcardStats {
  @Column({ name: "cards_studied_today", type: "int", default: 0 })
  cardsStudiedToday: number;

  @Column({ name: "time_spent_today", type: "int", default: 0 })
  timeSpentToday: number;

  @Column({ name: "current_streak", type: "int", default: 0 })
  currentStreak: number;

  @Column({ name: "longest_streak", type: "int", default: 0 })
  longestStreak: number;

  @Column({ name: "total_reviews", type: "int", default: 0 })
  totalReviews: number;

  @Column({ name: "total_study_time", type: "int", default: 0 })
  totalStudyTime: number;

  @Column({
    name: "retention_rate",
    type: "decimal",
    precision: 5,
    scale: 4,
    default: 0.0,
  })
  retentionRate: number;

  @Column({ name: "new_cards_count", type: "int", default: 0 })
  newCardsCount: number;

  @Column({ name: "learning_cards_count", type: "int", default: 0 })
  learningCardsCount: number;

  @Column({ name: "review_cards_count", type: "int", default: 0 })
  reviewCardsCount: number;

  @Column({ name: "suspended_cards_count", type: "int", default: 0 })
  suspendedCardsCount: number;

  @Column({ name: "mature_cards_count", type: "int", default: 0 })
  matureCardsCount: number;

  @Column({ name: "young_cards_count", type: "int", default: 0 })
  youngCardsCount: number;

  @Column({ name: "again_count", type: "int", default: 0 })
  againCount: number;

  @Column({ name: "hard_count", type: "int", default: 0 })
  hardCount: number;

  @Column({ name: "good_count", type: "int", default: 0 })
  goodCount: number;

  @Column({ name: "easy_count", type: "int", default: 0 })
  easyCount: number;

  @Column({ name: "start_date", type: "timestamptz" })
  startDate: Date;

  @Column({ name: "end_date", type: "timestamptz" })
  endDate: Date;
}
