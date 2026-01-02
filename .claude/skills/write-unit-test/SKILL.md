---
name: write-unit-test
description: Write unit tests for TypeScript code in this monorepo. Use when creating tests for new code, adding test coverage, or when asked to write tests. Follows Bun test patterns and project conventions.
---

# Write Unit Tests

Write unit tests for TypeScript code following project conventions using Bun test runner.

## Test Framework

This project uses **Bun test** as the test runner. Tests are located in `tests/` directory within each package.

## Test File Structure

```typescript
import { beforeEach, describe, expect, test } from "bun:test";
// Import from package using @ alias
import { SomeClass } from "@/SomeClass";
import type { ISomeInterface } from "@/types";

describe("ClassName", () => {
  // Setup if needed
  beforeEach(() => {
    // Reset state before each test
  });

  test("should do something specific", () => {
    // Arrange
    const instance = new SomeClass();
    
    // Act
    const result = instance.someMethod();
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Test file | `{ClassName}.spec.ts` | `UserService.spec.ts` |
| Test directory | `tests/` in package root | `packages/service/tests/` |
| Describe block | Class or module name | `describe("UserService", ...)` |
| Test case | `should + expected behavior` | `test("should return user by id", ...)` |

## Import Patterns

Use the `@/` alias to import from the package source:

```typescript
// Correct - use @ alias
import { decorator } from "@/decorators";
import type { IService } from "@/types";

// Wrong - don't use relative paths to src
import { decorator } from "../src/decorators";
```

External dependencies:

```typescript
import { Container, EContainerScope } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
```

## Common Test Patterns

### Testing Decorators

```typescript
import { beforeEach, describe, expect, test } from "bun:test";
import { Container, EContainerScope } from "@ooneex/container";
import { decorator } from "@/decorators";
import type { ISomeInterface } from "@/types";

describe("decorator.decoratorName", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  test("should register class successfully", () => {
    class TestClass implements ISomeInterface {
      // Implement interface methods
    }

    expect(() => {
      decorator.decoratorName()(TestClass);
    }).not.toThrow();
  });

  test("should register class with default singleton scope", () => {
    class SingletonClass implements ISomeInterface {
      // Implement interface methods
    }

    decorator.decoratorName()(SingletonClass);

    const instance1 = container.get(SingletonClass);
    const instance2 = container.get(SingletonClass);

    expect(instance1).toBe(instance2);
  });

  test("should register class with transient scope", () => {
    class TransientClass implements ISomeInterface {
      private static instanceCount = 0;
      public readonly instanceId: number;

      constructor() {
        TransientClass.instanceCount++;
        this.instanceId = TransientClass.instanceCount;
      }

      // Implement interface methods
    }

    decorator.decoratorName(EContainerScope.Transient)(TransientClass);

    const instance1 = container.get(TransientClass);
    const instance2 = container.get(TransientClass);

    expect(instance1).not.toBe(instance2);
    expect(instance1.instanceId).not.toBe(instance2.instanceId);
  });

  test("should register class with request scope", () => {
    class RequestScopedClass implements ISomeInterface {
      // Implement interface methods
    }

    expect(() => {
      decorator.decoratorName(EContainerScope.Request)(RequestScopedClass);
    }).not.toThrow();

    const instance = container.get(RequestScopedClass);
    expect(instance).toBeInstanceOf(RequestScopedClass);
  });

  test("should return void from the decorator function", () => {
    class VoidReturnClass implements ISomeInterface {
      // Implement interface methods
    }

    const result = decorator.decoratorName()(VoidReturnClass);
    expect(result).toBeUndefined();
  });
});
```

### Testing Classes

```typescript
import { describe, expect, test } from "bun:test";
import { SomeClass } from "@/SomeClass";

describe("SomeClass", () => {
  test("should create instance with default values", () => {
    const instance = new SomeClass();
    
    expect(instance).toBeInstanceOf(SomeClass);
  });

  test("should handle method with parameters", () => {
    const instance = new SomeClass();
    
    const result = instance.someMethod("param");
    
    expect(result).toBe(expectedValue);
  });

  test("should throw exception on invalid input", () => {
    const instance = new SomeClass();
    
    expect(() => {
      instance.someMethod(null);
    }).toThrow();
  });
});
```

### Testing Async Methods

```typescript
import { describe, expect, test } from "bun:test";
import { AsyncService } from "@/AsyncService";

describe("AsyncService", () => {
  test("should resolve async operation", async () => {
    const service = new AsyncService();
    
    const result = await service.asyncMethod();
    
    expect(result).toBeDefined();
  });

  test("should reject on error", async () => {
    const service = new AsyncService();
    
    await expect(service.failingMethod()).rejects.toThrow();
  });
});
```

### Testing Exceptions

```typescript
import { describe, expect, test } from "bun:test";
import { SomeException } from "@/SomeException";
import { HttpStatus } from "@ooneex/http-status";

describe("SomeException", () => {
  test("should create exception with message", () => {
    const exception = new SomeException("Error message");
    
    expect(exception.message).toBe("Error message");
    expect(exception.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  test("should create exception with custom data", () => {
    const exception = new SomeException("Error", { key: "value" });
    
    expect(exception.data).toEqual({ key: "value" });
  });
});
```

## Assertion Methods

Common Bun test assertions:

| Assertion | Description |
|-----------|-------------|
| `expect(a).toBe(b)` | Strict equality (===) |
| `expect(a).toEqual(b)` | Deep equality |
| `expect(a).toBeDefined()` | Not undefined |
| `expect(a).toBeNull()` | Is null |
| `expect(a).toBeTruthy()` | Truthy value |
| `expect(a).toBeFalsy()` | Falsy value |
| `expect(a).toBeInstanceOf(Class)` | Instance check |
| `expect(a).toContain(b)` | Array/string contains |
| `expect(a).toHaveLength(n)` | Array/string length |
| `expect(fn).toThrow()` | Function throws |
| `expect(fn).not.toThrow()` | Function doesn't throw |
| `expect(promise).rejects.toThrow()` | Promise rejects |
| `expect(a).toBeUndefined()` | Is undefined |

## Running Tests

```bash
# Run tests for specific package
bun test packages/<package-name>/tests

# Run specific test file
bun test packages/<package-name>/tests/SomeClass.spec.ts

# Run all tests
bun run test
```

## Checklist Before Writing Tests

1. Identify the class/module to test
2. Read the source code to understand the interface and behavior
3. Check if there's an existing test file to follow patterns
4. Create test file in `tests/` directory with `.spec.ts` suffix
5. Import using `@/` alias for package source
6. Write tests covering:
   - Basic instantiation
   - All public methods
   - Edge cases and error conditions
   - Different scopes (for decorators)
   - Async behavior (if applicable)

## Common Pitfalls

1. **Don't forget beforeEach for container tests** - Container state persists, reset it before each test
2. **Use `@/` alias** - Don't use relative paths to `../src/`
3. **Implement interface methods** - Mock classes must implement all required interface methods
4. **Test scopes separately** - Singleton, Transient, and Request scopes behave differently
5. **Mark noop methods** - Use `// noop` comment for empty method implementations
