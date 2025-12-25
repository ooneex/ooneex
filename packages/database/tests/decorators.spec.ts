import { beforeEach, describe, expect, test } from "bun:test";
import { Container, ContainerException, EContainerScope } from "@ooneex/container";
import { decorator } from "@/decorators";
import type { IDatabase } from "@/types";

describe("decorator.database", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  test("should register class ending with 'Database' successfully", () => {
    class TestDatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database()(TestDatabase);
    }).not.toThrow();
  });

  test("should register class with default singleton scope", () => {
    class SingletonDatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    decorator.database()(SingletonDatabase);

    const instance1 = container.get(SingletonDatabase);
    const instance2 = container.get(SingletonDatabase);

    expect(instance1).toBe(instance2);
  });

  test("should register class with explicit singleton scope", () => {
    class ExplicitSingletonDatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    decorator.database(EContainerScope.Singleton)(ExplicitSingletonDatabase);

    const instance1 = container.get(ExplicitSingletonDatabase);
    const instance2 = container.get(ExplicitSingletonDatabase);

    expect(instance1).toBe(instance2);
  });

  test("should register class with transient scope", () => {
    class TransientDatabase implements IDatabase {
      private static instanceCount = 0;
      public readonly instanceId: number;

      constructor() {
        TransientDatabase.instanceCount++;
        this.instanceId = TransientDatabase.instanceCount;
      }

      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    decorator.database(EContainerScope.Transient)(TransientDatabase);

    const instance1 = container.get(TransientDatabase);
    const instance2 = container.get(TransientDatabase);

    expect(instance1).not.toBe(instance2);
    expect(instance1.instanceId).not.toBe(instance2.instanceId);
  });

  test("should register class with request scope", () => {
    class RequestScopedDatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database(EContainerScope.Request)(RequestScopedDatabase);
    }).not.toThrow();

    const instance = container.get(RequestScopedDatabase);
    expect(instance).toBeInstanceOf(RequestScopedDatabase);
  });

  test("should throw ContainerException for class not ending with 'Database'", () => {
    class InvalidConnection implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database()(InvalidConnection);
    }).toThrow(ContainerException);
  });

  test("should throw ContainerException with correct message for invalid class name", () => {
    class WrongNaming implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database()(WrongNaming);
    }).toThrow('Class name "WrongNaming" must end with "Database"');
  });

  test("should throw for class name containing 'Database' but not ending with it", () => {
    class DatabaseConnection implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database()(DatabaseConnection);
    }).toThrow(ContainerException);
  });

  test("should throw for class name ending with lowercase 'database'", () => {
    class Testdatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database()(Testdatabase);
    }).toThrow(ContainerException);
  });

  test("should register class with complex name ending in 'Database'", () => {
    class PostgreSqlProductionDatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    expect(() => {
      decorator.database()(PostgreSqlProductionDatabase);
    }).not.toThrow();
  });

  test("should allow retrieving registered Database class from container", () => {
    class RetrievableDatabase implements IDatabase {
      public readonly name = "retrievable";

      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    decorator.database()(RetrievableDatabase);

    const instance = container.get(RetrievableDatabase);
    expect(instance).toBeInstanceOf(RetrievableDatabase);
    expect(instance.name).toBe("retrievable");
  });

  test("should return void from the decorator function", () => {
    class VoidReturnDatabase implements IDatabase {
      public async open(): Promise<void> {
        // noop
      }
      public async close(): Promise<void> {
        // noop
      }
      public async drop(): Promise<void> {
        // noop
      }
    }

    const result = decorator.database()(VoidReturnDatabase);
    expect(result).toBeUndefined();
  });
});
