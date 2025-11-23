import type { IImage } from "@ooneex/image";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IBase, IStat } from "@ooneex/types";
import type { ESessionType, ILevel } from "../types";

export enum EFlashcardState {
  /** Brand new card that hasn't been studied yet */
  NEW = "new",
  /** Card in learning phase with short intervals */
  LEARNING = "learning",
  /** Card in relearning phase after being forgotten */
  RELEARNING = "relearning",
  /** Graduated card in long-term review cycle */
  REVIEW = "review",
  /** Card temporarily hidden until next day */
  BURIED = "buried",
  /** Card permanently hidden from reviews */
  SUSPENDED = "suspended",
}

export enum EFlashcardRating {
  /** Incorrect answer - restart learning */
  AGAIN = "again",
  /** Correct but difficult - shorter interval */
  HARD = "hard",
  /** Correct with some effort - normal interval */
  GOOD = "good",
  /** Correct with no effort - longer interval */
  EASY = "easy",
}

export enum EFlashcardSessionStatus {
  DRAFT = "draft",
  STARTED = "started",
  PAUSED = "paused",
  COMPLETED = "completed",
}

export enum EFlashcardAlgorithm {
  /** Legacy SuperMemo 2 algorithm */
  SM2 = "sm2",
  /** Free Spaced Repetition Scheduler (modern) */
  FSRS = "fsrs",
}

export interface IFlashcardSchedule extends IBase {
  /** Current state of the card */
  state: EFlashcardState;
  /** Days until next review */
  interval: number;
  /** Ease factor for SM-2 algorithm (2.5 = 250%) */
  easeFactor: number;
  /** Number of times card has been reviewed */
  reviewCount: number;
  /** Number of times card has failed (lapses) */
  lapseCount: number;
  /** Current step in learning/relearning sequence */
  currentStep: number;
  /** When the card is due for review */
  dueDate: Date;
  /** Last time the card was reviewed */
  lastReviewedAt?: Date | null;
  /** FSRS-specific parameters */
  difficulty?: number; // FSRS difficulty (0-10)
  stability?: number; // FSRS stability in days
  retrievability?: number; // FSRS retrievability (0-1)
  /** Learning steps for this card (in minutes) */
  learningSteps: number[];
  /** Relearning steps for this card (in minutes) */
  relearningSteps: number[];
}

export interface IFlashcard extends IBase {
  /** Front side content */
  front: string;
  /** Back side content */
  back: string;
  /** Optional hint text */
  hint?: string;
  /** Optional context or source */
  context?: string;
  contextId?: string;
  /** Scheduling information */
  schedule: IFlashcardSchedule;
  /** Additional metadata */
  tags?: ITag[];
  stat?: IStat;
  status?: IStatus;
  image?: IImage;
}

export interface IFlashcardReview extends IBase {
  /** The flashcard being reviewed */
  card: IFlashcard;
  /** Session this review belongs to */
  session: IFlashcardSession;
  /** User's rating for this review */
  rating: EFlashcardRating;
  /** Time taken to answer (in seconds) */
  responseTime: number;
  /** Previous interval before this review */
  previousInterval: number;
  /** New interval after this review */
  newInterval: number;
  /** Previous ease factor */
  previousEaseFactor: number;
  /** New ease factor */
  newEaseFactor: number;
  /** Previous due date */
  previousDueDate: Date;
  /** New due date */
  newDueDate: Date;
  /** Previous card state */
  previousState: EFlashcardState;
  /** New card state */
  newState: EFlashcardState;
  /** Whether this was a lapse (forgotten card) */
  wasLapse: boolean;
  /** Algorithm used for scheduling */
  algorithm: EFlashcardAlgorithm;
  /** Review timestamp */
  reviewedAt: Date;
}

export interface IFlashcardSession extends IBase {
  name: string;
  /** Total cards available for study */
  totalCards: number;
  /** Number of new cards in session */
  newCardsCount: number;
  /** Number of learning cards in session */
  learningCardsCount: number;
  /** Number of review cards in session */
  reviewCardsCount: number;
  /** Cards studied so far */
  studiedCount: number;
  /** Cards answered correctly */
  correctCount: number;
  /** Cards answered incorrectly */
  incorrectCount: number;
  /** Total study time in seconds */
  studyTime: number;
  /** Cards in this session */
  cards: IFlashcard[];
  /** Reviews completed in this session */
  reviews: IFlashcardReview[];
  /** Session status */
  status: EFlashcardSessionStatus;
  /** Overall session score (0-100) */
  score: number;
  /** Session start time */
  startedAt?: Date | null;
  /** Session pause time */
  pausedAt?: Date | null;
  /** Session resume time */
  resumedAt?: Date | null;
  /** Session completion time */
  completedAt?: Date | null;
  /** Type of study session */
  type: ESessionType;
  /** Difficulty level */
  level: ILevel;
  /** Algorithm configuration */
  algorithm: EFlashcardAlgorithm;
  /** Maximum new cards per session */
  maxNewCards: number;
  /** Maximum review cards per session */
  maxReviewCards: number;
  /** Desired retention rate (0-1) for FSRS */
  desiredRetention: number;
  /** Learning steps (in minutes) */
  learningSteps: number[];
  /** Graduating interval (in days) */
  graduatingInterval: number;
  /** Easy interval (in days) */
  easyInterval: number;
  /** Maximum interval (in days) */
  maxInterval: number;
}

export interface IFlashcardDeck extends IBase {
  name: string;
  description?: string;
  /** Total cards in deck */
  totalCards: number;
  /** New cards ready to learn */
  newCards: number;
  /** Cards in learning phase */
  learningCards: number;
  /** Cards due for review today */
  dueCards: number;
  /** Cards suspended */
  suspendedCards: number;
  /** All flashcards in this deck */
  cards: IFlashcard[];
  /** Deck settings */
  algorithm: EFlashcardAlgorithm;
  maxNewCardsPerDay: number;
  maxReviewCardsPerDay: number;
  desiredRetention: number;
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  maxInterval: number;
  /** FSRS parameters (17 parameters) */
  fsrsParameters?: number[];
  /** Leech threshold (number of lapses before marking as leech) */
  leechThreshold: number;
  /** Whether to bury sibling cards */
  burySiblings: boolean;
  /** Deck statistics */
  stat?: IStat;
  status?: IStatus;
}

export interface IFlashcardPreset extends IBase {
  name: string;
  description?: string;
  /** Algorithm to use */
  algorithm: EFlashcardAlgorithm;
  /** Learning configuration */
  learningSteps: number[];
  relearningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  maxInterval: number;
  /** Daily limits */
  maxNewCardsPerDay: number;
  maxReviewCardsPerDay: number;
  /** FSRS configuration */
  desiredRetention: number;
  fsrsParameters?: number[];
  /** SM-2 configuration */
  startingEaseFactor: number;
  easyBonus: number;
  intervalModifier: number;
  hardInterval: number;
  newInterval: number;
  /** Lapse configuration */
  minimumInterval: number;
  leechThreshold: number;
  /** Display options */
  burySiblings: boolean;
  showTimer: boolean;
  autoPlayAudio: boolean;
}

export interface IFlashcardStats extends IBase {
  /** Cards studied today */
  cardsStudiedToday: number;
  /** Time spent studying today (minutes) */
  timeSpentToday: number;
  /** Current streak (days) */
  currentStreak: number;
  /** Longest streak (days) */
  longestStreak: number;
  /** Total reviews all time */
  totalReviews: number;
  /** Total study time all time (minutes) */
  totalStudyTime: number;
  /** Average retention rate */
  retentionRate: number;
  /** Breakdown by card state */
  newCardsCount: number;
  learningCardsCount: number;
  reviewCardsCount: number;
  suspendedCardsCount: number;
  /** Maturity statistics */
  matureCardsCount: number; // Cards with interval >= 21 days
  youngCardsCount: number; // Cards with interval < 21 days
  /** Performance by rating */
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  /** Date range for these stats */
  startDate: Date;
  endDate: Date;
}
