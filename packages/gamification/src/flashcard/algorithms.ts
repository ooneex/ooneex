import type { EFlashcardRating, EFlashcardState, IFlashcard, IFlashcardReview, IFlashcardSchedule } from "./types";

/**
 * Base interface for spaced repetition algorithms
 */
export interface ISpacedRepetitionAlgorithm {
  /**
   * Calculate the next review schedule for a card
   */
  calculateNextReview: (card: IFlashcard, rating: EFlashcardRating, reviewTime: number) => IFlashcardSchedule;

  /**
   * Get the predicted intervals for each rating button
   */
  getIntervalPreview: (card: IFlashcard) => Record<EFlashcardRating, number>;

  /**
   * Initialize a new card's schedule
   */
  initializeCard: (learningSteps: number[]) => IFlashcardSchedule;

  /**
   * Get algorithm-specific parameters
   */
  getParameters: () => Record<string, unknown>;

  /**
   * Update algorithm parameters
   */
  setParameters: (parameters: Record<string, unknown>) => void;
}

/**
 * SM-2 (SuperMemo 2) Algorithm Implementation Interface
 */
export interface ISM2Algorithm extends ISpacedRepetitionAlgorithm {
  /**
   * SM-2 specific parameters
   */
  getParameters: () => {
    startingEaseFactor: number;
    easyBonus: number;
    intervalModifier: number;
    hardInterval: number;
    newInterval: number;
    minimumInterval: number;
    maxInterval: number;
    graduatingInterval: number;
    easyInterval: number;
  };

  /**
   * Calculate ease factor adjustment
   */
  calculateEaseAdjustment: (rating: EFlashcardRating, currentEase: number) => number;

  /**
   * Calculate interval for review cards
   */
  calculateReviewInterval: (previousInterval: number, easeFactor: number, rating: EFlashcardRating) => number;

  /**
   * Handle learning phase transitions
   */
  processLearningCard: (
    card: IFlashcard,
    rating: EFlashcardRating,
    learningSteps: number[],
  ) => {
    newState: EFlashcardState;
    interval: number;
    currentStep: number;
  };

  /**
   * Handle lapse (forgotten card)
   */
  processLapse: (
    card: IFlashcard,
    relearningSteps: number[],
  ) => {
    newState: EFlashcardState;
    interval: number;
    easeFactor: number;
    currentStep: number;
  };
}

/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Interface
 */
export interface IFSRSAlgorithm extends ISpacedRepetitionAlgorithm {
  /**
   * FSRS specific parameters (17 parameters)
   */
  getParameters: () => {
    parameters: number[]; // 17 FSRS parameters
    desiredRetention: number;
    requestRetention: number;
    maxInterval: number;
  };

  /**
   * Calculate memory state (Difficulty, Stability, Retrievability)
   */
  calculateMemoryState: (
    difficulty: number,
    stability: number,
    retrievability: number,
    rating: EFlashcardRating,
    deltaT: number,
  ) => {
    newDifficulty: number;
    newStability: number;
    newRetrievability: number;
  };

  /**
   * Calculate retrievability based on time elapsed
   */
  calculateRetrievability: (stability: number, deltaT: number) => number;

  /**
   * Calculate next interval based on desired retention
   */
  calculateInterval: (stability: number, desiredRetention: number) => number;

  /**
   * Initialize FSRS card state
   */
  initializeFSRSCard: () => {
    difficulty: number;
    stability: number;
    retrievability: number;
  };

  /**
   * Optimize parameters based on review history
   */
  optimizeParameters: (reviews: IFlashcardReview[]) => number[];

  /**
   * Evaluate parameter quality
   */
  evaluateParameters: (reviews: IFlashcardReview[]) => {
    logLoss: number;
    rmse: number;
  };
}

/**
 * Algorithm factory for creating algorithm instances
 */
export interface IAlgorithmFactory {
  /**
   * Create SM-2 algorithm instance
   */
  createSM2Algorithm: (parameters?: Partial<ISM2Algorithm["getParameters"]>) => ISM2Algorithm;

  /**
   * Create FSRS algorithm instance
   */
  createFSRSAlgorithm: (parameters?: Partial<IFSRSAlgorithm["getParameters"]>) => IFSRSAlgorithm;

  /**
   * Get default parameters for an algorithm
   */
  getDefaultParameters: (algorithm: "sm2" | "fsrs") => Record<string, unknown>;
}

/**
 * Algorithm utilities and helpers
 */
export interface IAlgorithmUtils {
  /**
   * Apply fuzzing to interval (randomization)
   */
  applyFuzzing: (interval: number, fuzzFactor?: number) => number;

  /**
   * Convert learning steps from minutes to intervals
   */
  convertLearningSteps: (steps: number[]) => number[];

  /**
   * Calculate next due date
   */
  calculateDueDate: (interval: number, baseDate?: Date) => Date;

  /**
   * Determine if interval should be fuzzed
   */
  shouldApplyFuzzing: (interval: number) => boolean;

  /**
   * Clamp interval to valid range
   */
  clampInterval: (interval: number, minInterval: number, maxInterval: number) => number;

  /**
   * Calculate average interval for multiple ratings
   */
  calculateAverageInterval: (intervals: number[]) => number;
}

/**
 * Review statistics calculator
 */
export interface IReviewStats {
  /**
   * Calculate retention rate from reviews
   */
  calculateRetention: (reviews: IFlashcardReview[]) => number;

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime: (reviews: IFlashcardReview[]) => number;

  /**
   * Get rating distribution
   */
  getRatingDistribution: (reviews: IFlashcardReview[]) => Record<EFlashcardRating, number>;

  /**
   * Calculate study load (cards per day)
   */
  calculateStudyLoad: (cards: IFlashcard[]) => {
    newCards: number;
    learningCards: number;
    reviewCards: number;
    total: number;
  };

  /**
   * Predict future workload
   */
  predictWorkload: (
    cards: IFlashcard[],
    algorithm: ISpacedRepetitionAlgorithm,
    days: number,
  ) => {
    date: Date;
    newCards: number;
    reviews: number;
    total: number;
  }[];
}

/**
 * Scheduler for managing card due dates and priorities
 */
export interface ICardScheduler {
  /**
   * Get cards due for review
   */
  getDueCards: (cards: IFlashcard[], maxCards?: number) => IFlashcard[];

  /**
   * Get new cards ready for learning
   */
  getNewCards: (cards: IFlashcard[], maxCards?: number) => IFlashcard[];

  /**
   * Get learning cards ready for next step
   */
  getLearningCards: (cards: IFlashcard[]) => IFlashcard[];

  /**
   * Sort cards by priority
   */
  sortCardsByPriority: (cards: IFlashcard[], sortOrder: "due" | "random" | "added") => IFlashcard[];

  /**
   * Check if card is overdue
   */
  isOverdue: (card: IFlashcard) => boolean;

  /**
   * Calculate overdue factor
   */
  getOverdueFactor: (card: IFlashcard) => number;

  /**
   * Reschedule all cards with new algorithm
   */
  rescheduleCards: (cards: IFlashcard[], algorithm: ISpacedRepetitionAlgorithm) => IFlashcard[];
}
