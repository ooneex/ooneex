---
name: fix-diagnostics
description: Fix TypeScript and Biome diagnostics in the codebase. Use when there are type errors, linting issues, formatting problems, or after running build/lint commands that report errors. Analyzes diagnostic output and applies fixes systematically.
---

# Fix Diagnostics

Systematically fix TypeScript type errors and Biome linting/formatting issues in the codebase.

## Workflow

1. **Run diagnostics to identify issues**
   ```bash
   # TypeScript type checking
   bunx tsc --noEmit
   
   # Biome linting and formatting
   bun run lint
   
   # Or check specific package
   bunx tsc --noEmit -p packages/<package-name>/tsconfig.json
   ```

2. **Parse diagnostic output**
   - Extract file path, line number, and error code
   - Group errors by file for efficient fixing
   - Prioritize by error type (blocking errors first)

3. **Fix each issue**
   - Read the file to understand context
   - Apply the appropriate fix
   - Verify the fix doesn't introduce new errors

4. **Re-run diagnostics to confirm fixes**

## TypeScript Error Categories

### Type Mismatch Errors

| Error Code | Description | Common Fix |
|------------|-------------|------------|
| TS2322 | Type not assignable | Add type assertion, fix return type, or update variable type |
| TS2345 | Argument type mismatch | Cast argument or update function signature |
| TS2339 | Property doesn't exist | Add property to interface, use optional chaining, or type guard |
| TS2532 | Object possibly undefined | Add null check or use optional chaining (`?.`) |
| TS2531 | Object possibly null | Add null check or non-null assertion (`!`) |

### Import/Export Errors

| Error Code | Description | Common Fix |
|------------|-------------|------------|
| TS2307 | Cannot find module | Fix import path, install package, or add to tsconfig paths |
| TS2305 | Module has no exported member | Check export name, use correct named export |
| TS2614 | Module has no default export | Use named import instead of default |

### Declaration Errors

| Error Code | Description | Common Fix |
|------------|-------------|------------|
| TS2304 | Cannot find name | Import missing type/value, or declare it |
| TS2451 | Duplicate identifier | Rename variable or use different scope |
| TS7006 | Parameter has implicit any | Add explicit type annotation |
| TS7031 | Binding element has implicit any | Add type to destructured parameter |

### Strict Mode Errors

| Error Code | Description | Common Fix |
|------------|-------------|------------|
| TS2564 | Property not initialized | Add initializer, make optional, or use definite assignment (`!:`) |
| TS18048 | Value possibly undefined | Add undefined check before use |
| TS2769 | No overload matches | Check argument types match an overload signature |

## Biome Error Categories

### Linting Rules

| Rule | Description | Fix |
|------|-------------|-----|
| `noUnusedVariables` | Unused variable/import | Remove or prefix with `_` |
| `noUnusedImports` | Unused import | Remove the import |
| `noExplicitAny` | Explicit `any` type | Replace with specific type or `unknown` |
| `noNonNullAssertion` | Non-null assertion (`!`) | Add proper null check |
| `useConst` | Variable never reassigned | Change `let` to `const` |
| `noVar` | Using `var` keyword | Change to `let` or `const` |
| `eqeqeq` | Using `==` or `!=` | Change to `===` or `!==` |

### Formatting Rules

| Issue | Fix |
|-------|-----|
| Incorrect indentation | Use tabs (project default) |
| Missing/extra semicolons | Follow project style (semicolons required) |
| Line too long | Break into multiple lines |
| Trailing whitespace | Remove trailing spaces |

## Fixing Strategies

### Strategy 1: Auto-fix with Biome

```bash
# Auto-fix all safe fixes
bun run fmt

# Or with Biome directly
bunx biome check --write .
```

### Strategy 2: Fix by File

For each file with errors:
1. Read the file
2. Apply all fixes for that file
3. Move to next file

### Strategy 3: Fix by Error Type

Fix all instances of one error type across codebase:
1. Fix all TS2532 (possibly undefined) errors
2. Fix all TS2322 (type mismatch) errors
3. Continue with next error type

## Examples

### Example 1: Fixing Type Mismatch

Error:
```
src/service/UserService.ts:45:5 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

Before:
```typescript
const name: string = user.name;
```

After:
```typescript
const name: string = user.name ?? '';
// Or with type guard:
if (user.name) {
  const name: string = user.name;
}
```

### Example 2: Fixing Missing Property

Error:
```
src/types.ts:12:3 - error TS2339: Property 'email' does not exist on type 'User'.
```

Fix - Add to interface:
```typescript
interface User {
  name: string;
  email: string;  // Add missing property
}
```

### Example 3: Fixing Unused Import

Error:
```
src/index.ts:1:10 - lint/correctness/noUnusedImports: This import is unused.
```

Before:
```typescript
import { useState, useEffect, useCallback } from 'react';
// Only useState and useEffect are used
```

After:
```typescript
import { useState, useEffect } from 'react';
```

### Example 4: Fixing Implicit Any

Error:
```
src/utils.ts:5:20 - error TS7006: Parameter 'item' implicitly has an 'any' type.
```

Before:
```typescript
function process(item) {
  return item.value;
}
```

After:
```typescript
function process(item: { value: string }): string {
  return item.value;
}
```

### Example 5: Fixing Possibly Undefined

Error:
```
src/api.ts:23:10 - error TS2532: Object is possibly 'undefined'.
```

Before:
```typescript
const result = data.items.map(i => i.name);
```

After:
```typescript
const result = data.items?.map(i => i.name) ?? [];
// Or with guard:
if (data.items) {
  const result = data.items.map(i => i.name);
}
```

## Verification

After fixing, always verify:

```bash
# Check TypeScript compiles
bunx tsc --noEmit

# Check Biome passes
bun run lint

# Run tests to ensure fixes don't break functionality
bun test
```

## Common Pitfalls

1. **Don't suppress errors without understanding them**
   - Avoid `@ts-ignore` or `@ts-expect-error` unless absolutely necessary
   - Avoid `as any` type assertions

2. **Don't break existing functionality**
   - Changing types can have cascading effects
   - Run tests after fixing

3. **Don't add unnecessary null checks**
   - If a value is guaranteed to exist, trust the type system
   - Use definite assignment assertion for constructor-initialized properties

4. **Prefer fixing root cause over symptoms**
   - If many errors stem from one incorrect type, fix the type definition first
