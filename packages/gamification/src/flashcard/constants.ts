import { EFlashcardAlgorithm, EFlashcardRating, EFlashcardState } from "./types";

/**
 * Default Anki algorithm constants
 */
export const ANKI_DEFAULTS = {
  // Learning phase
  LEARNING_STEPS: [1, 10], // 1 minute, 10 minutes
  GRADUATING_INTERVAL: 1, // 1 day
  EASY_INTERVAL: 4, // 4 days

  // Review phase (SM-2)
  STARTING_EASE_FACTOR: 2.5, // 250%
  EASY_BONUS: 1.3, // 130%
  INTERVAL_MODIFIER: 1.0, // 100%
  HARD_INTERVAL: 1.2, // 120%

  // Lapses
  RELEARNING_STEPS: [10], // 10 minutes
  NEW_INTERVAL: 0.0, // 0% of previous interval
  MINIMUM_INTERVAL: 1, // 1 day
  LEECH_THRESHOLD: 8, // 8 lapses

  // Daily limits
  MAX_NEW_CARDS_PER_DAY: 20,
  MAX_REVIEW_CARDS_PER_DAY: 200,

  // Timing
  MAX_ANSWER_TIME: 60, // 60 seconds
  MIN_INTERVAL: 1, // 1 day minimum
  MAX_INTERVAL: 36500, // 100 years

  // FSRS
  DESIRED_RETENTION: 0.9, // 90%
  FSRS_DEFAULT_PARAMETERS: [
    0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824, 1.9813, 0.0953, 0.2975,
    2.2042, 0.2407, 2.9466,
  ],
} as const;

/**
 * Rating multipliers for interval calculation
 */
export const RATING_MULTIPLIERS = {
  [EFlashcardRating.AGAIN]: 0, // Reset to learning
  [EFlashcardRating.HARD]: 1.2,
  [EFlashcardRating.GOOD]: 2.5, // Default ease factor
  [EFlashcardRating.EASY]: 2.5 * 1.3, // Easy bonus applied
} as const;

/**
 * Ease factor adjustments based on rating
 */
export const EASE_ADJUSTMENTS = {
  [EFlashcardRating.AGAIN]: -0.2, // Decrease ease by 20%
  [EFlashcardRating.HARD]: -0.15, // Decrease ease by 15%
  [EFlashcardRating.GOOD]: 0, // No change
  [EFlashcardRating.EASY]: 0.15, // Increase ease by 15%
} as const;

/**
 * Minimum and maximum ease factor bounds
 */
export const EASE_BOUNDS = {
  MIN: 1.3, // 130% minimum
  MAX: 2.5, // 250% maximum (no upper bound in practice)
} as const;

/**
 * Card state transitions based on rating
 */
export const STATE_TRANSITIONS = {
  [EFlashcardState.NEW]: {
    [EFlashcardRating.AGAIN]: EFlashcardState.LEARNING,
    [EFlashcardRating.HARD]: EFlashcardState.LEARNING,
    [EFlashcardRating.GOOD]: EFlashcardState.LEARNING,
    [EFlashcardRating.EASY]: EFlashcardState.REVIEW,
  },
  [EFlashcardState.LEARNING]: {
    [EFlashcardRating.AGAIN]: EFlashcardState.LEARNING, // Restart learning
    [EFlashcardRating.HARD]: EFlashcardState.LEARNING, // Repeat current step
    [EFlashcardRating.GOOD]: EFlashcardState.LEARNING, // Next step or graduate
    [EFlashcardRating.EASY]: EFlashcardState.REVIEW, // Skip to review
  },
  [EFlashcardState.REVIEW]: {
    [EFlashcardRating.AGAIN]: EFlashcardState.RELEARNING,
    [EFlashcardRating.HARD]: EFlashcardState.REVIEW,
    [EFlashcardRating.GOOD]: EFlashcardState.REVIEW,
    [EFlashcardRating.EASY]: EFlashcardState.REVIEW,
  },
  [EFlashcardState.RELEARNING]: {
    [EFlashcardRating.AGAIN]: EFlashcardState.RELEARNING, // Restart relearning
    [EFlashcardRating.HARD]: EFlashcardState.RELEARNING, // Repeat current step
    [EFlashcardRating.GOOD]: EFlashcardState.RELEARNING, // Next step or back to review
    [EFlashcardRating.EASY]: EFlashcardState.REVIEW, // Skip to review
  },
} as const;

/**
 * Learning step multipliers for Hard button
 */
export const LEARNING_HARD_MULTIPLIERS = {
  FIRST_STEP: 1.5, // 150% of first step when only one step
  AVERAGE_STEPS: 0.5, // 50% of average between current and next step
} as const;

/**
 * Fuzz factor for randomizing intervals
 */
export const FUZZ_FACTOR = {
  MIN: 0.95, // 95% of calculated interval
  MAX: 1.05, // 105% of calculated interval
} as const;

/**
 * Session scoring weights
 */
export const SCORE_WEIGHTS = {
  [EFlashcardRating.AGAIN]: 0, // 0 points
  [EFlashcardRating.HARD]: 50, // 50 points
  [EFlashcardRating.GOOD]: 80, // 80 points
  [EFlashcardRating.EASY]: 100, // 100 points
} as const;

/**
 * Card maturity threshold (days)
 */
export const MATURITY_THRESHOLD = 21; // Cards with interval >= 21 days are mature

/**
 * Default preset configurations
 */
export const DEFAULT_PRESETS = {
  BEGINNER: {
    name: "Beginner",
    description: "For new learners with more repetition",
    learningSteps: [1, 10, 1440], // 1m, 10m, 1d
    graduatingInterval: 2,
    easyInterval: 7,
    maxNewCardsPerDay: 10,
    desiredRetention: 0.85,
  },
  DEFAULT: {
    name: "Default",
    description: "Balanced settings for most users",
    learningSteps: [1, 10], // 1m, 10m
    graduatingInterval: 1,
    easyInterval: 4,
    maxNewCardsPerDay: 20,
    desiredRetention: 0.9,
  },
  INTENSIVE: {
    name: "Intensive",
    description: "For serious learners who want higher retention",
    learningSteps: [1, 10], // 1m, 10m
    graduatingInterval: 1,
    easyInterval: 4,
    maxNewCardsPerDay: 30,
    desiredRetention: 0.95,
  },
  LIGHT: {
    name: "Light",
    description: "For casual learning with fewer reviews",
    learningSteps: [1, 10], // 1m, 10m
    graduatingInterval: 3,
    easyInterval: 7,
    maxNewCardsPerDay: 15,
    desiredRetention: 0.8,
  },
} as const;

/**
 * Algorithm-specific constants
 */
export const ALGORITHM_CONSTANTS = {
  [EFlashcardAlgorithm.SM2]: {
    MIN_EASE_FACTOR: 1.3,
    MAX_EASE_FACTOR: 2.5,
    EASE_ADJUSTMENT_STEP: 0.15,
  },
  [EFlashcardAlgorithm.FSRS]: {
    MIN_DIFFICULTY: 1,
    MAX_DIFFICULTY: 10,
    MIN_STABILITY: 0.1,
    MAX_STABILITY: 36500,
    MIN_RETRIEVABILITY: 0.01,
    MAX_RETRIEVABILITY: 0.99,
  },
} as const;

/**
 * Utility functions for common calculations
 */
export const UTILS = {
  /**
   * Convert minutes to milliseconds
   */
  minutesToMs: (minutes: number): number => minutes * 60 * 1000,

  /**
   * Convert days to milliseconds
   */
  daysToMs: (days: number): number => days * 24 * 60 * 60 * 1000,

  /**
   * Apply fuzz factor to interval
   */
  applyFuzz: (interval: number): number => {
    const fuzz = FUZZ_FACTOR.MIN + Math.random() * (FUZZ_FACTOR.MAX - FUZZ_FACTOR.MIN);
    return Math.max(1, Math.round(interval * fuzz));
  },

  /**
   * Clamp ease factor to valid range
   */
  clampEaseFactor: (ease: number): number => {
    return Math.max(EASE_BOUNDS.MIN, Math.min(ease, EASE_BOUNDS.MAX));
  },

  /**
   * Calculate session score
   */
  calculateScore: (ratings: EFlashcardRating[]): number => {
    if (ratings.length === 0) return 0;
    const totalPoints = ratings.reduce((sum, rating) => sum + SCORE_WEIGHTS[rating], 0);
    const maxPossible = ratings.length * SCORE_WEIGHTS[EFlashcardRating.EASY];
    return Math.round((totalPoints / maxPossible) * 100);
  },

  /**
   * Determine if card is mature
   */
  isMature: (interval: number): boolean => interval >= MATURITY_THRESHOLD,
} as const;
