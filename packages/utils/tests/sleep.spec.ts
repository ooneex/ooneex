import { beforeEach, describe, expect, test } from "bun:test";
import { sleep } from "@/sleep";

describe("sleep", () => {
  let startTime: number;

  beforeEach(() => {
    startTime = Date.now();
  });

  describe("basic functionality", () => {
    test("should return a Promise", () => {
      const result = sleep(100);
      expect(result).toBeInstanceOf(Promise);
    });

    test("should resolve to undefined", async () => {
      const result = await sleep(10);
      expect(result).toBeUndefined();
    });

    test("should delay execution for the specified time", async () => {
      const delay = 100;
      await sleep(delay);
      const elapsed = Date.now() - startTime;

      // Allow for some timing variance (±20ms)
      expect(elapsed).toBeGreaterThanOrEqual(delay - 20);
      expect(elapsed).toBeLessThanOrEqual(delay + 50);
    });
  });

  describe("timing accuracy", () => {
    test("should handle zero delay", async () => {
      await sleep(0);
      const elapsed = Date.now() - startTime;

      // Should complete almost immediately
      expect(elapsed).toBeLessThan(10);
    });

    test("should handle very short delays", async () => {
      const delay = 1;
      await sleep(delay);
      const elapsed = Date.now() - startTime;

      // Very short delays might not be precise, but should still delay
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(50);
    });

    test("should handle medium delays accurately", async () => {
      const delay = 200;
      await sleep(delay);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(delay - 30);
      expect(elapsed).toBeLessThanOrEqual(delay + 100);
    });

    test("should handle longer delays", async () => {
      const delay = 500;
      await sleep(delay);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(delay - 50);
      expect(elapsed).toBeLessThanOrEqual(delay + 150);
    });
  });

  describe("concurrent execution", () => {
    test("should handle multiple concurrent sleep calls", async () => {
      const delay = 100;
      const promises = [sleep(delay), sleep(delay), sleep(delay)];

      await Promise.all(promises);
      const elapsed = Date.now() - startTime;

      // All should complete around the same time
      expect(elapsed).toBeGreaterThanOrEqual(delay - 20);
      expect(elapsed).toBeLessThanOrEqual(delay + 100);
    });

    test("should handle different delay times concurrently", async () => {
      const shortDelay = 50;
      const longDelay = 150;

      const shortPromise = sleep(shortDelay);
      const longPromise = sleep(longDelay);

      await shortPromise;
      const shortElapsed = Date.now() - startTime;

      await longPromise;
      const longElapsed = Date.now() - startTime;

      expect(shortElapsed).toBeGreaterThanOrEqual(shortDelay - 20);
      expect(shortElapsed).toBeLessThan(longDelay);
      expect(longElapsed).toBeGreaterThanOrEqual(longDelay - 20);
    });
  });

  describe("edge cases", () => {
    test("should handle negative delays (treated as 1ms by setTimeout)", async () => {
      await sleep(-100);
      const elapsed = Date.now() - startTime;

      // Negative delays are treated as 1ms by setTimeout, so should complete quickly but not immediately
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(50);
    });

    test("should handle decimal delays", async () => {
      const delay = 50.5;
      await sleep(delay);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(Math.floor(delay) - 20);
      expect(elapsed).toBeLessThanOrEqual(Math.ceil(delay) + 50);
    });

    test("should handle very large delays", async () => {
      const delay = 1000;
      const promise = sleep(delay);

      // We won't wait for it to complete, just verify it's a promise
      expect(promise).toBeInstanceOf(Promise);

      // Verify it hasn't resolved immediately
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });

      await sleep(10);
      expect(resolved).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    test("should work in sequential async operations", async () => {
      const delays = [50, 100, 75];
      const results = [];

      for (const delay of delays) {
        const stepStart = Date.now();
        await sleep(delay);
        const stepElapsed = Date.now() - stepStart;
        results.push(stepElapsed);
      }

      results.forEach((elapsed, index) => {
        const expectedDelay = delays[index];
        if (expectedDelay !== undefined) {
          expect(elapsed).toBeGreaterThanOrEqual(expectedDelay - 20);
          expect(elapsed).toBeLessThanOrEqual(expectedDelay + 50);
        }
      });
    });

    test("should work with Promise.race", async () => {
      const fastPromise = sleep(50);
      const slowPromise = sleep(200);

      await Promise.race([fastPromise, slowPromise]);
      const elapsed = Date.now() - startTime;

      // Should complete when the faster promise resolves
      expect(elapsed).toBeGreaterThanOrEqual(30);
      expect(elapsed).toBeLessThan(100);
    });

    test("should work with async/await error handling", async () => {
      try {
        await sleep(50);
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(30);
      } catch (_e) {
        // Should not throw any errors
        expect(true).toBe(false);
      }
    });
  });

  describe("parametrized tests", () => {
    test.each([[10], [25], [50], [100], [250]])("should delay for %dms", async (delay) => {
      await sleep(delay);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(delay - 20);
      expect(elapsed).toBeLessThanOrEqual(delay + 100);
    });
  });

  describe("promise behavior", () => {
    test("should be thenable", async () => {
      let resolved = false;

      sleep(50).then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      await sleep(100);
      expect(resolved).toBe(true);
    });

    test("should support promise chaining", async () => {
      const result = await sleep(50)
        .then(() => "first")
        .then((value) => `${value}-second`);

      expect(result).toBe("first-second");
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(30);
    });

    test("should work with Promise.all", async () => {
      const promises = [sleep(50), sleep(75), sleep(100)];

      await Promise.all(promises);
      const elapsed = Date.now() - startTime;

      // Should wait for the longest delay
      expect(elapsed).toBeGreaterThanOrEqual(80);
      expect(elapsed).toBeLessThanOrEqual(150);
    });
  });

  describe("real world usage scenarios", () => {
    test("should work for rate limiting", async () => {
      const operations = [];
      const operationDelay = 100;

      for (let i = 0; i < 3; i++) {
        const opStart = Date.now();
        // Simulate some work
        await sleep(10);
        // Rate limit delay
        await sleep(operationDelay);
        operations.push(Date.now() - opStart);
      }

      operations.forEach((duration) => {
        expect(duration).toBeGreaterThanOrEqual(operationDelay);
      });
    });

    test("should work for retry delays", async () => {
      let attempt = 0;
      const maxAttempts = 3;
      const baseDelay = 50;

      const performOperation = async (): Promise<string> => {
        attempt++;
        if (attempt < maxAttempts) {
          await sleep(baseDelay * attempt); // Exponential backoff
          return performOperation();
        }
        return "success";
      };

      const result = await performOperation();
      expect(result).toBe("success");
      expect(attempt).toBe(maxAttempts);

      const elapsed = Date.now() - startTime;
      const expectedMinDelay = baseDelay + baseDelay * 2; // 50 + 100
      expect(elapsed).toBeGreaterThanOrEqual(expectedMinDelay - 20);
    });

    test("should work for animation timing", async () => {
      const frameDelay = 16; // ~60fps
      const frames = 5;
      const frameTimings = [];

      for (let frame = 0; frame < frames; frame++) {
        const frameStart = Date.now();
        await sleep(frameDelay);
        frameTimings.push(Date.now() - frameStart);
      }

      frameTimings.forEach((timing) => {
        expect(timing).toBeGreaterThanOrEqual(frameDelay - 5);
        expect(timing).toBeLessThanOrEqual(frameDelay + 30);
      });
    });

    test("should work for debouncing simulation", async () => {
      let executionCount = 0;
      const debounceDelay = 100;

      const debouncedFunction = async () => {
        await sleep(debounceDelay);
        executionCount++;
      };

      // Simulate rapid calls
      const promises = [debouncedFunction(), debouncedFunction(), debouncedFunction()];

      await Promise.all(promises);

      // All should complete after the delay
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(debounceDelay - 20);
      expect(executionCount).toBe(3);
    });
  });
});
