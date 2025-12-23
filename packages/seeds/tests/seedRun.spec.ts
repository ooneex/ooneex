import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { container } from "@ooneex/container";
import { SEEDS_CONTAINER } from "@/container";
import type { ISeed, SeedClassType } from "@/types";

// Capture logger instances created by seedRun()
const LOGGER_INSTANCES: Array<{
  info: ReturnType<typeof mock>;
  warn: ReturnType<typeof mock>;
  error: ReturnType<typeof mock>;
  success: ReturnType<typeof mock>;
}> = [];

mock.module("@ooneex/logger", () => {
  class TerminalLogger {
    public info = mock(() => {});
    public warn = mock(() => {});
    public error = mock(() => {});
    public success = mock(() => {});

    constructor() {
      LOGGER_INSTANCES.push(this);
    }
  }

  return { TerminalLogger };
});

// Ensure the module under test sees our logger mock.
const { seedRun } = await import("@/seedRun");

describe("seedRun", () => {
  let originalGet: typeof container.get;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    originalGet = container.get;
    originalExit = process.exit;

    SEEDS_CONTAINER.length = 0;
    LOGGER_INSTANCES.length = 0;

    // Replace process.exit so a failing seed doesn't terminate the test runner
    process.exit = mock(() => {
      throw new Error("process.exit called");
    }) as unknown as typeof process.exit;
  });

  afterEach(() => {
    container.get = originalGet;
    process.exit = originalExit;
    SEEDS_CONTAINER.length = 0;
    LOGGER_INSTANCES.length = 0;
  });

  test("should log and return when there are no seeds", async () => {
    await seedRun();

    expect(LOGGER_INSTANCES).toHaveLength(1);
    const logger = LOGGER_INSTANCES[0];
    expect(logger).toBeDefined();
    if (!logger) throw new Error("expected TerminalLogger instance");
    expect(logger.info).toHaveBeenCalledWith("No seeds found\n", undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  });

  test("should run dependencies before running the seed", async () => {
    const calls: string[] = [];

    class DependencySeed implements ISeed {
      run<T = unknown>(_data?: unknown[]): T | Promise<T> {
        calls.push("dependency.run");
        return "dep-result" as unknown as T;
      }
      isActive() {
        return true;
      }
      getDependencies() {
        return [];
      }
    }

    class MainSeed implements ISeed {
      run<T = unknown>(_data?: unknown[]): T | Promise<T> {
        calls.push("main.run");
        return Promise.resolve(undefined as unknown as T);
      }
      isActive() {
        return true;
      }
      getDependencies() {
        return [DependencySeed as unknown as SeedClassType];
      }
    }

    const dep = new DependencySeed();
    const main = new MainSeed();

    SEEDS_CONTAINER.push(MainSeed as unknown as SeedClassType);

    container.get = mock((klass: SeedClassType) => {
      if (klass === (DependencySeed as unknown as SeedClassType)) return dep;
      if (klass === (MainSeed as unknown as SeedClassType)) return main;
      throw new Error("unexpected seed class");
    }) as unknown as typeof container.get;

    await seedRun();

    expect(calls).toEqual(["dependency.run", "main.run"]);
  });

  test("should warn and skip inactive seeds", async () => {
    class InactiveSeed implements ISeed {
      private calls = 0;

      run<T = unknown>(_data?: unknown[]): T | Promise<T> {
        throw new Error("should not run");
      }

      // getSeeds() filters by seed.isActive(), so we return true for the first call
      // (so the seed is discovered) and false for the second call (seedRun's own check).
      isActive() {
        return this.calls++ === 0;
      }

      getDependencies() {
        return [];
      }
    }

    const seedInstance = new InactiveSeed();
    SEEDS_CONTAINER.push(InactiveSeed as unknown as SeedClassType);

    container.get = mock(() => seedInstance) as unknown as typeof container.get;

    await seedRun();

    const logger = LOGGER_INSTANCES[0];
    expect(logger).toBeDefined();
    if (!logger) throw new Error("expected TerminalLogger instance");
    expect(logger.warn).toHaveBeenCalledWith(`Seed ${seedInstance.constructor.name} is inactive\n`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  });

  test("should log error and call process.exit(1) on failure", async () => {
    class FailingSeed implements ISeed {
      run<T = unknown>(_data?: unknown[]): T | Promise<T> {
        throw new Error("boom");
      }
      isActive() {
        return true;
      }
      getDependencies() {
        return [];
      }
    }

    const seedInstance = new FailingSeed();
    SEEDS_CONTAINER.push(FailingSeed as unknown as SeedClassType);

    container.get = mock(() => seedInstance) as unknown as typeof container.get;

    expect(seedRun()).rejects.toThrow("process.exit called");

    const logger = LOGGER_INSTANCES[0];
    expect(logger).toBeDefined();
    if (!logger) throw new Error("expected TerminalLogger instance");
    expect(logger.error).toHaveBeenCalledWith(`Seed ${seedInstance.constructor.name} failed\n`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
