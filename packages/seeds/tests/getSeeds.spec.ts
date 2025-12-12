import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { container } from "@ooneex/container";
import { SEEDS_CONTAINER } from "@/container";
import { getSeeds } from "@/getSeeds";
import type { ISeed, SeedClassType } from "@/types";

describe("getSeeds", () => {
  let originalGet: typeof container.get;

  beforeEach(() => {
    originalGet = container.get;
    SEEDS_CONTAINER.length = 0;
  });

  afterEach(() => {
    container.get = originalGet;
    SEEDS_CONTAINER.length = 0;
  });

  test("should resolve instances from container and return only active seeds", () => {
    class ActiveSeed implements ISeed {
      run<T = unknown>(_data?: unknown[]): T | Promise<T> {
        return Promise.resolve(undefined as unknown as T);
      }
      isActive() {
        return true;
      }
      getDependencies() {
        return [];
      }
    }

    class InactiveSeed implements ISeed {
      run<T = unknown>(_data?: unknown[]): T | Promise<T> {
        return Promise.resolve(undefined as unknown as T);
      }
      isActive() {
        return false;
      }
      getDependencies() {
        return [];
      }
    }

    const active = new ActiveSeed();
    const inactive = new InactiveSeed();

    SEEDS_CONTAINER.push(ActiveSeed as unknown as SeedClassType, InactiveSeed as unknown as SeedClassType);

    container.get = mock((klass: SeedClassType) => {
      if (klass === (ActiveSeed as unknown as SeedClassType)) return active;
      if (klass === (InactiveSeed as unknown as SeedClassType)) return inactive;
      throw new Error("unexpected seed class");
    }) as unknown as typeof container.get;

    const seeds = getSeeds();

    expect(container.get).toHaveBeenCalledTimes(2);
    expect(seeds).toEqual([active]);
  });
});
