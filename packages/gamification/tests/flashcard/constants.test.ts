import { describe, expect, test } from "bun:test";
import { EFlashcardAlgorithm, EFlashcardRating, EFlashcardState } from "@/flashcard";
import {
  ALGORITHM_CONSTANTS,
  ANKI_DEFAULTS,
  DEFAULT_PRESETS,
  EASE_ADJUSTMENTS,
  EASE_BOUNDS,
  FUZZ_FACTOR,
  LEARNING_HARD_MULTIPLIERS,
  MATURITY_THRESHOLD,
  RATING_MULTIPLIERS,
  SCORE_WEIGHTS,
  STATE_TRANSITIONS,
  UTILS,
} from "@/flashcard/constants";

describe("Flashcard Constants", () => {
  describe("ANKI_DEFAULTS", () => {
    test("should have correct learning phase constants", () => {
      expect(ANKI_DEFAULTS.LEARNING_STEPS).toEqual([1, 10]);
      expect(ANKI_DEFAULTS.GRADUATING_INTERVAL).toBe(1);
      expect(ANKI_DEFAULTS.EASY_INTERVAL).toBe(4);
    });

    test("should have correct review phase constants", () => {
      expect(ANKI_DEFAULTS.STARTING_EASE_FACTOR).toBe(2.5);
      expect(ANKI_DEFAULTS.EASY_BONUS).toBe(1.3);
      expect(ANKI_DEFAULTS.INTERVAL_MODIFIER).toBe(1.0);
      expect(ANKI_DEFAULTS.HARD_INTERVAL).toBe(1.2);
    });

    test("should have correct lapse constants", () => {
      expect(ANKI_DEFAULTS.RELEARNING_STEPS).toEqual([10]);
      expect(ANKI_DEFAULTS.NEW_INTERVAL).toBe(0.0);
      expect(ANKI_DEFAULTS.MINIMUM_INTERVAL).toBe(1);
      expect(ANKI_DEFAULTS.LEECH_THRESHOLD).toBe(8);
    });

    test("should have correct daily limits", () => {
      expect(ANKI_DEFAULTS.MAX_NEW_CARDS_PER_DAY).toBe(20);
      expect(ANKI_DEFAULTS.MAX_REVIEW_CARDS_PER_DAY).toBe(200);
    });

    test("should have correct timing constants", () => {
      expect(ANKI_DEFAULTS.MAX_ANSWER_TIME).toBe(60);
      expect(ANKI_DEFAULTS.MIN_INTERVAL).toBe(1);
      expect(ANKI_DEFAULTS.MAX_INTERVAL).toBe(36500);
    });

    test("should have correct FSRS constants", () => {
      expect(ANKI_DEFAULTS.DESIRED_RETENTION).toBe(0.9);
      expect(ANKI_DEFAULTS.FSRS_DEFAULT_PARAMETERS).toHaveLength(17);
      expect(ANKI_DEFAULTS.FSRS_DEFAULT_PARAMETERS[0]).toBe(0.4072);
    });

    test("should be immutable constant", () => {
      expect(typeof ANKI_DEFAULTS).toBe("object");
      expect(ANKI_DEFAULTS).toBeDefined();
    });
  });

  describe("RATING_MULTIPLIERS", () => {
    test("should have correct multipliers for each rating", () => {
      expect(RATING_MULTIPLIERS[EFlashcardRating.AGAIN]).toBe(0);
      expect(RATING_MULTIPLIERS[EFlashcardRating.HARD]).toBe(1.2);
      expect(RATING_MULTIPLIERS[EFlashcardRating.GOOD]).toBe(2.5);
      expect(RATING_MULTIPLIERS[EFlashcardRating.EASY]).toBe(2.5 * 1.3);
    });

    test("should include all rating types", () => {
      const ratingKeys = Object.keys(RATING_MULTIPLIERS);
      const expectedRatings = Object.values(EFlashcardRating);
      expect(ratingKeys).toHaveLength(expectedRatings.length);
      expectedRatings.forEach((rating) => {
        expect(ratingKeys).toContain(rating);
      });
    });

    test("should be frozen object", () => {
      expect(Object.isFrozen(RATING_MULTIPLIERS)).toBe(true);
    });
  });

  describe("EASE_ADJUSTMENTS", () => {
    test("should have correct adjustments for each rating", () => {
      expect(EASE_ADJUSTMENTS[EFlashcardRating.AGAIN]).toBe(-0.2);
      expect(EASE_ADJUSTMENTS[EFlashcardRating.HARD]).toBe(-0.15);
      expect(EASE_ADJUSTMENTS[EFlashcardRating.GOOD]).toBe(0);
      expect(EASE_ADJUSTMENTS[EFlashcardRating.EASY]).toBe(0.15);
    });

    test("should include all rating types", () => {
      const adjustmentKeys = Object.keys(EASE_ADJUSTMENTS);
      const expectedRatings = Object.values(EFlashcardRating);
      expect(adjustmentKeys).toHaveLength(expectedRatings.length);
      expectedRatings.forEach((rating) => {
        expect(adjustmentKeys).toContain(rating);
      });
    });

    test("should be frozen object", () => {
      expect(Object.isFrozen(EASE_ADJUSTMENTS)).toBe(true);
    });
  });

  describe("EASE_BOUNDS", () => {
    test("should have correct minimum and maximum bounds", () => {
      expect(EASE_BOUNDS.MIN).toBe(1.3);
      expect(EASE_BOUNDS.MAX).toBe(2.5);
    });

    test("minimum should be less than maximum", () => {
      expect(EASE_BOUNDS.MIN).toBeLessThan(EASE_BOUNDS.MAX);
    });

    test("should be immutable constant", () => {
      expect(typeof EASE_BOUNDS).toBe("object");
      expect(EASE_BOUNDS).toBeDefined();
    });
  });

  describe("STATE_TRANSITIONS", () => {
    test("should handle NEW state transitions correctly", () => {
      const newTransitions = STATE_TRANSITIONS[EFlashcardState.NEW];
      expect(newTransitions[EFlashcardRating.AGAIN]).toBe(EFlashcardState.LEARNING);
      expect(newTransitions[EFlashcardRating.HARD]).toBe(EFlashcardState.LEARNING);
      expect(newTransitions[EFlashcardRating.GOOD]).toBe(EFlashcardState.LEARNING);
      expect(newTransitions[EFlashcardRating.EASY]).toBe(EFlashcardState.REVIEW);
    });

    test("should handle LEARNING state transitions correctly", () => {
      const learningTransitions = STATE_TRANSITIONS[EFlashcardState.LEARNING];
      expect(learningTransitions[EFlashcardRating.AGAIN]).toBe(EFlashcardState.LEARNING);
      expect(learningTransitions[EFlashcardRating.HARD]).toBe(EFlashcardState.LEARNING);
      expect(learningTransitions[EFlashcardRating.GOOD]).toBe(EFlashcardState.LEARNING);
      expect(learningTransitions[EFlashcardRating.EASY]).toBe(EFlashcardState.REVIEW);
    });

    test("should handle REVIEW state transitions correctly", () => {
      const reviewTransitions = STATE_TRANSITIONS[EFlashcardState.REVIEW];
      expect(reviewTransitions[EFlashcardRating.AGAIN]).toBe(EFlashcardState.RELEARNING);
      expect(reviewTransitions[EFlashcardRating.HARD]).toBe(EFlashcardState.REVIEW);
      expect(reviewTransitions[EFlashcardRating.GOOD]).toBe(EFlashcardState.REVIEW);
      expect(reviewTransitions[EFlashcardRating.EASY]).toBe(EFlashcardState.REVIEW);
    });

    test("should handle RELEARNING state transitions correctly", () => {
      const relearningTransitions = STATE_TRANSITIONS[EFlashcardState.RELEARNING];
      expect(relearningTransitions[EFlashcardRating.AGAIN]).toBe(EFlashcardState.RELEARNING);
      expect(relearningTransitions[EFlashcardRating.HARD]).toBe(EFlashcardState.RELEARNING);
      expect(relearningTransitions[EFlashcardRating.GOOD]).toBe(EFlashcardState.RELEARNING);
      expect(relearningTransitions[EFlashcardRating.EASY]).toBe(EFlashcardState.REVIEW);
    });

    test("should handle BURIED state transitions correctly", () => {
      const buriedTransitions = STATE_TRANSITIONS[EFlashcardState.BURIED];
      Object.values(EFlashcardRating).forEach((rating) => {
        expect(buriedTransitions[rating]).toBe(EFlashcardState.BURIED);
      });
    });

    test("should handle SUSPENDED state transitions correctly", () => {
      const suspendedTransitions = STATE_TRANSITIONS[EFlashcardState.SUSPENDED];
      Object.values(EFlashcardRating).forEach((rating) => {
        expect(suspendedTransitions[rating]).toBe(EFlashcardState.SUSPENDED);
      });
    });

    test("should include all states and ratings", () => {
      const stateKeys = Object.keys(STATE_TRANSITIONS);
      const expectedStates = Object.values(EFlashcardState);
      expect(stateKeys).toHaveLength(expectedStates.length);

      Object.values(STATE_TRANSITIONS).forEach((transitions) => {
        const ratingKeys = Object.keys(transitions);
        const expectedRatings = Object.values(EFlashcardRating);
        expect(ratingKeys).toHaveLength(expectedRatings.length);
      });
    });

    test("should be deeply frozen", () => {
      expect(Object.isFrozen(STATE_TRANSITIONS)).toBe(true);
      Object.values(STATE_TRANSITIONS).forEach((transitions) => {
        expect(Object.isFrozen(transitions)).toBe(true);
      });
    });
  });

  describe("LEARNING_HARD_MULTIPLIERS", () => {
    test("should have correct multiplier values", () => {
      expect(LEARNING_HARD_MULTIPLIERS.FIRST_STEP).toBe(1.5);
      expect(LEARNING_HARD_MULTIPLIERS.AVERAGE_STEPS).toBe(0.5);
    });

    test("should be immutable constant", () => {
      expect(typeof LEARNING_HARD_MULTIPLIERS).toBe("object");
      expect(LEARNING_HARD_MULTIPLIERS).toBeDefined();
    });
  });

  describe("FUZZ_FACTOR", () => {
    test("should have correct range values", () => {
      expect(FUZZ_FACTOR.MIN).toBe(0.95);
      expect(FUZZ_FACTOR.MAX).toBe(1.05);
    });

    test("minimum should be less than maximum", () => {
      expect(FUZZ_FACTOR.MIN).toBeLessThan(FUZZ_FACTOR.MAX);
    });

    test("should be immutable constant", () => {
      expect(typeof FUZZ_FACTOR).toBe("object");
      expect(FUZZ_FACTOR).toBeDefined();
    });
  });

  describe("SCORE_WEIGHTS", () => {
    test("should have correct weights for each rating", () => {
      expect(SCORE_WEIGHTS[EFlashcardRating.AGAIN]).toBe(0);
      expect(SCORE_WEIGHTS[EFlashcardRating.HARD]).toBe(50);
      expect(SCORE_WEIGHTS[EFlashcardRating.GOOD]).toBe(80);
      expect(SCORE_WEIGHTS[EFlashcardRating.EASY]).toBe(100);
    });

    test("should have ascending weights", () => {
      expect(SCORE_WEIGHTS[EFlashcardRating.AGAIN]).toBeLessThan(SCORE_WEIGHTS[EFlashcardRating.HARD]);
      expect(SCORE_WEIGHTS[EFlashcardRating.HARD]).toBeLessThan(SCORE_WEIGHTS[EFlashcardRating.GOOD]);
      expect(SCORE_WEIGHTS[EFlashcardRating.GOOD]).toBeLessThan(SCORE_WEIGHTS[EFlashcardRating.EASY]);
    });

    test("should include all rating types", () => {
      const weightKeys = Object.keys(SCORE_WEIGHTS);
      const expectedRatings = Object.values(EFlashcardRating);
      expect(weightKeys).toHaveLength(expectedRatings.length);
      expectedRatings.forEach((rating) => {
        expect(weightKeys).toContain(rating);
      });
    });

    test("should be frozen object", () => {
      expect(Object.isFrozen(SCORE_WEIGHTS)).toBe(true);
    });
  });

  describe("MATURITY_THRESHOLD", () => {
    test("should have correct threshold value", () => {
      expect(MATURITY_THRESHOLD).toBe(21);
    });

    test("should be a positive number", () => {
      expect(MATURITY_THRESHOLD).toBeGreaterThan(0);
    });
  });

  describe("DEFAULT_PRESETS", () => {
    test("should have all preset types", () => {
      expect(DEFAULT_PRESETS.BEGINNER).toBeDefined();
      expect(DEFAULT_PRESETS.DEFAULT).toBeDefined();
      expect(DEFAULT_PRESETS.INTENSIVE).toBeDefined();
      expect(DEFAULT_PRESETS.LIGHT).toBeDefined();
    });

    test("BEGINNER preset should have correct configuration", () => {
      const preset = DEFAULT_PRESETS.BEGINNER;
      expect(preset.name).toBe("Beginner");
      expect(preset.learningSteps).toEqual([1, 10, 1440]);
      expect(preset.graduatingInterval).toBe(2);
      expect(preset.easyInterval).toBe(7);
      expect(preset.maxNewCardsPerDay).toBe(10);
      expect(preset.desiredRetention).toBe(0.85);
    });

    test("DEFAULT preset should have correct configuration", () => {
      const preset = DEFAULT_PRESETS.DEFAULT;
      expect(preset.name).toBe("Default");
      expect(preset.learningSteps).toEqual([1, 10]);
      expect(preset.graduatingInterval).toBe(1);
      expect(preset.easyInterval).toBe(4);
      expect(preset.maxNewCardsPerDay).toBe(20);
      expect(preset.desiredRetention).toBe(0.9);
    });

    test("INTENSIVE preset should have correct configuration", () => {
      const preset = DEFAULT_PRESETS.INTENSIVE;
      expect(preset.name).toBe("Intensive");
      expect(preset.learningSteps).toEqual([1, 10]);
      expect(preset.graduatingInterval).toBe(1);
      expect(preset.easyInterval).toBe(4);
      expect(preset.maxNewCardsPerDay).toBe(30);
      expect(preset.desiredRetention).toBe(0.95);
    });

    test("LIGHT preset should have correct configuration", () => {
      const preset = DEFAULT_PRESETS.LIGHT;
      expect(preset.name).toBe("Light");
      expect(preset.learningSteps).toEqual([1, 10]);
      expect(preset.graduatingInterval).toBe(3);
      expect(preset.easyInterval).toBe(7);
      expect(preset.maxNewCardsPerDay).toBe(15);
      expect(preset.desiredRetention).toBe(0.8);
    });

    test("should have ascending desired retention rates", () => {
      expect(DEFAULT_PRESETS.LIGHT.desiredRetention).toBeLessThan(DEFAULT_PRESETS.BEGINNER.desiredRetention);
      expect(DEFAULT_PRESETS.BEGINNER.desiredRetention).toBeLessThan(DEFAULT_PRESETS.DEFAULT.desiredRetention);
      expect(DEFAULT_PRESETS.DEFAULT.desiredRetention).toBeLessThan(DEFAULT_PRESETS.INTENSIVE.desiredRetention);
    });

    test("should be immutable constant", () => {
      expect(typeof DEFAULT_PRESETS).toBe("object");
      expect(DEFAULT_PRESETS).toBeDefined();
      expect(DEFAULT_PRESETS.BEGINNER).toBeDefined();
      expect(DEFAULT_PRESETS.DEFAULT).toBeDefined();
      expect(DEFAULT_PRESETS.INTENSIVE).toBeDefined();
      expect(DEFAULT_PRESETS.LIGHT).toBeDefined();
    });
  });

  describe("ALGORITHM_CONSTANTS", () => {
    test("should have SM2 constants", () => {
      const sm2Constants = ALGORITHM_CONSTANTS[EFlashcardAlgorithm.SM2];
      expect(sm2Constants.MIN_EASE_FACTOR).toBe(1.3);
      expect(sm2Constants.MAX_EASE_FACTOR).toBe(2.5);
      expect(sm2Constants.EASE_ADJUSTMENT_STEP).toBe(0.15);
    });

    test("should have FSRS constants", () => {
      const fsrsConstants = ALGORITHM_CONSTANTS[EFlashcardAlgorithm.FSRS];
      expect(fsrsConstants.MIN_DIFFICULTY).toBe(1);
      expect(fsrsConstants.MAX_DIFFICULTY).toBe(10);
      expect(fsrsConstants.MIN_STABILITY).toBe(0.1);
      expect(fsrsConstants.MAX_STABILITY).toBe(36500);
      expect(fsrsConstants.MIN_RETRIEVABILITY).toBe(0.01);
      expect(fsrsConstants.MAX_RETRIEVABILITY).toBe(0.99);
    });

    test("should have valid ranges", () => {
      const sm2 = ALGORITHM_CONSTANTS[EFlashcardAlgorithm.SM2];
      expect(sm2.MIN_EASE_FACTOR).toBeLessThan(sm2.MAX_EASE_FACTOR);

      const fsrs = ALGORITHM_CONSTANTS[EFlashcardAlgorithm.FSRS];
      expect(fsrs.MIN_DIFFICULTY).toBeLessThan(fsrs.MAX_DIFFICULTY);
      expect(fsrs.MIN_STABILITY).toBeLessThan(fsrs.MAX_STABILITY);
      expect(fsrs.MIN_RETRIEVABILITY).toBeLessThan(fsrs.MAX_RETRIEVABILITY);
    });

    test("should be deeply frozen", () => {
      expect(Object.isFrozen(ALGORITHM_CONSTANTS)).toBe(true);
      expect(Object.isFrozen(ALGORITHM_CONSTANTS[EFlashcardAlgorithm.SM2])).toBe(true);
      expect(Object.isFrozen(ALGORITHM_CONSTANTS[EFlashcardAlgorithm.FSRS])).toBe(true);
    });
  });

  describe("UTILS", () => {
    describe("minutesToMs", () => {
      test("should convert minutes to milliseconds correctly", () => {
        expect(UTILS.minutesToMs(1)).toBe(60000);
        expect(UTILS.minutesToMs(10)).toBe(600000);
        expect(UTILS.minutesToMs(60)).toBe(3600000);
      });

      test("should handle zero and decimals", () => {
        expect(UTILS.minutesToMs(0)).toBe(0);
        expect(UTILS.minutesToMs(0.5)).toBe(30000);
      });
    });

    describe("daysToMs", () => {
      test("should convert days to milliseconds correctly", () => {
        expect(UTILS.daysToMs(1)).toBe(86400000);
        expect(UTILS.daysToMs(7)).toBe(604800000);
      });

      test("should handle zero and decimals", () => {
        expect(UTILS.daysToMs(0)).toBe(0);
        expect(UTILS.daysToMs(0.5)).toBe(43200000);
      });
    });

    describe("applyFuzz", () => {
      test("should return a number within fuzz range", () => {
        const interval = 10;
        const fuzzedInterval = UTILS.applyFuzz(interval);

        expect(fuzzedInterval).toBeGreaterThanOrEqual(Math.round(interval * FUZZ_FACTOR.MIN));
        expect(fuzzedInterval).toBeLessThanOrEqual(Math.round(interval * FUZZ_FACTOR.MAX));
      });

      test("should never return less than 1", () => {
        expect(UTILS.applyFuzz(0.1)).toBeGreaterThanOrEqual(1);
        expect(UTILS.applyFuzz(0.5)).toBeGreaterThanOrEqual(1);
      });

      test("should return integer values", () => {
        for (let i = 0; i < 100; i++) {
          const result = UTILS.applyFuzz(10);
          expect(Number.isInteger(result)).toBe(true);
        }
      });
    });

    describe("clampEaseFactor", () => {
      test("should clamp values to valid range", () => {
        expect(UTILS.clampEaseFactor(1.0)).toBe(EASE_BOUNDS.MIN);
        expect(UTILS.clampEaseFactor(3.0)).toBe(EASE_BOUNDS.MAX);
        expect(UTILS.clampEaseFactor(2.0)).toBe(2.0);
      });

      test("should handle boundary values", () => {
        expect(UTILS.clampEaseFactor(EASE_BOUNDS.MIN)).toBe(EASE_BOUNDS.MIN);
        expect(UTILS.clampEaseFactor(EASE_BOUNDS.MAX)).toBe(EASE_BOUNDS.MAX);
      });
    });

    describe("calculateScore", () => {
      test("should calculate score correctly for various ratings", () => {
        const allEasy = [EFlashcardRating.EASY, EFlashcardRating.EASY, EFlashcardRating.EASY];
        expect(UTILS.calculateScore(allEasy)).toBe(100);

        const allAgain = [EFlashcardRating.AGAIN, EFlashcardRating.AGAIN];
        expect(UTILS.calculateScore(allAgain)).toBe(0);

        const mixed = [EFlashcardRating.EASY, EFlashcardRating.GOOD, EFlashcardRating.HARD, EFlashcardRating.AGAIN];
        const expectedScore = Math.round(((100 + 80 + 50 + 0) / (100 * 4)) * 100);
        expect(UTILS.calculateScore(mixed)).toEqual(expectedScore);
      });

      test("should return 0 for empty array", () => {
        expect(UTILS.calculateScore([])).toBe(0);
      });

      test("should return integer values", () => {
        const ratings = [EFlashcardRating.GOOD, EFlashcardRating.HARD];
        const score = UTILS.calculateScore(ratings);
        expect(Number.isInteger(score)).toBe(true);
      });
    });

    describe("isMature", () => {
      test("should identify mature cards correctly", () => {
        expect(UTILS.isMature(MATURITY_THRESHOLD)).toBe(true);
        expect(UTILS.isMature(MATURITY_THRESHOLD + 1)).toBe(true);
        expect(UTILS.isMature(30)).toBe(true);
      });

      test("should identify immature cards correctly", () => {
        expect(UTILS.isMature(MATURITY_THRESHOLD - 1)).toBe(false);
        expect(UTILS.isMature(1)).toBe(false);
        expect(UTILS.isMature(0)).toBe(false);
      });
    });

    test("should be immutable constant", () => {
      expect(typeof UTILS).toBe("object");
      expect(UTILS).toBeDefined();
    });
  });

  describe("Constant integrity", () => {
    test("ease bounds should match algorithm constants", () => {
      const sm2Constants = ALGORITHM_CONSTANTS[EFlashcardAlgorithm.SM2];
      expect(Number(EASE_BOUNDS.MIN)).toBe(Number(sm2Constants.MIN_EASE_FACTOR));
      expect(Number(EASE_BOUNDS.MAX)).toBe(Number(sm2Constants.MAX_EASE_FACTOR));
    });

    test("rating multipliers should be consistent with ease adjustments", () => {
      // EASY rating should have highest multiplier and positive adjustment
      expect(RATING_MULTIPLIERS[EFlashcardRating.EASY]).toBeGreaterThan(RATING_MULTIPLIERS[EFlashcardRating.GOOD]);
      expect(EASE_ADJUSTMENTS[EFlashcardRating.EASY]).toBeGreaterThan(0);

      // AGAIN rating should have lowest multiplier and negative adjustment
      expect(RATING_MULTIPLIERS[EFlashcardRating.AGAIN]).toBeLessThan(RATING_MULTIPLIERS[EFlashcardRating.HARD]);
      expect(EASE_ADJUSTMENTS[EFlashcardRating.AGAIN]).toBeLessThan(0);
    });

    test("score weights should be in ascending order", () => {
      const weights = [
        SCORE_WEIGHTS[EFlashcardRating.AGAIN],
        SCORE_WEIGHTS[EFlashcardRating.HARD],
        SCORE_WEIGHTS[EFlashcardRating.GOOD],
        SCORE_WEIGHTS[EFlashcardRating.EASY],
      ];

      for (let i = 1; i < weights.length; i++) {
        expect(weights[i]).toBeGreaterThan(weights[i - 1] as number);
      }
    });

    test("preset retention rates should be valid probabilities", () => {
      Object.values(DEFAULT_PRESETS).forEach((preset) => {
        expect(preset.desiredRetention).toBeGreaterThan(0);
        expect(preset.desiredRetention).toBeLessThanOrEqual(1);
      });
    });

    test("FSRS parameters should have correct length", () => {
      expect(ANKI_DEFAULTS.FSRS_DEFAULT_PARAMETERS).toHaveLength(17);
    });

    test("intervals should be positive", () => {
      expect(ANKI_DEFAULTS.GRADUATING_INTERVAL).toBeGreaterThan(0);
      expect(ANKI_DEFAULTS.EASY_INTERVAL).toBeGreaterThan(0);
      expect(ANKI_DEFAULTS.MIN_INTERVAL).toBeGreaterThan(0);
      expect(ANKI_DEFAULTS.MAX_INTERVAL).toBeGreaterThan(ANKI_DEFAULTS.MIN_INTERVAL);
    });
  });
});
