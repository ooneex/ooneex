import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ContainerException, container, EContainerScope } from "@ooneex/container";
import { SEEDS_CONTAINER } from "@/container";
import { seed } from "@/decorators";
import type { ISeed, SeedClassType } from "@/types";

describe("seed decorator", () => {
  let originalAdd: typeof container.add;

  beforeEach(() => {
    originalAdd = container.add;
    container.add = mock(() => {});
    SEEDS_CONTAINER.length = 0;
  });

  afterEach(() => {
    container.add = originalAdd;
    SEEDS_CONTAINER.length = 0;
  });

  test("should register Seed class in container and SEEDS_CONTAINER (default scope Singleton)", () => {
    @seed()
    class UserSeed implements ISeed {
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

    expect(container.add).toHaveBeenCalledTimes(1);
    expect(container.add).toHaveBeenCalledWith(UserSeed, EContainerScope.Singleton);
    expect(SEEDS_CONTAINER).toHaveLength(1);
    expect(SEEDS_CONTAINER[0]).toBe(UserSeed);
  });

  test("should accept custom scope parameter", () => {
    @seed(EContainerScope.Transient)
    class AnotherSeed implements ISeed {
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

    expect(container.add).toHaveBeenCalledWith(AnotherSeed, EContainerScope.Transient);
  });

  test("should throw ContainerException when class name does not end with 'Seed'", () => {
    class InvalidName implements ISeed {
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

    expect(() => seed()(InvalidName as unknown as SeedClassType)).toThrow(ContainerException);
    expect(() => seed()(InvalidName as unknown as SeedClassType)).toThrow(
      'Class name "InvalidName" must end with "Seed"',
    );
  });
});
