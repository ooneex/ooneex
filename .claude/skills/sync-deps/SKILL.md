---
name: sync-deps
description: Synchronize @ooneex dependencies in package.json based on imports in src files. Scans TypeScript files, detects runtime vs type-only imports, and updates dependencies/devDependencies accordingly.
---

# Sync Dependencies

Automatically synchronize `@ooneex/*` dependencies in a package's `package.json` based on actual imports found in `src/` files.

## Workflow

1. **Identify target package(s)**
   - If a specific package is provided, sync that package
   - If no package specified, ask which package to sync or sync all

2. **Scan source files for imports**
   - Read all `.ts` files in `packages/<package-name>/src/`
   - Extract all `@ooneex/*` import statements
   - Categorize imports as runtime or type-only

3. **Determine dependency type**
   - **Runtime imports** → `dependencies`
   - **Type-only imports** → `devDependencies`

4. **Update package.json**
   - Add missing dependencies
   - Move misplaced dependencies (runtime in devDeps or vice versa)
   - Remove unused @ooneex dependencies
   - Keep non-@ooneex dependencies unchanged

## Import Detection Rules

### Runtime Imports (→ dependencies)

These imports require the module at runtime:

```typescript
// Direct import of values/classes/functions
import { Container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";

// Mixed import (has at least one non-type import)
import { Exception, type IException } from "@ooneex/exception";

// Default imports
import Container from "@ooneex/container";

// Side-effect imports
import "@ooneex/container";

// Namespace imports used as values
import * as container from "@ooneex/container";
```

### Type-Only Imports (→ devDependencies)

These imports are erased at compile time:

```typescript
// Explicit type import
import type { IContainer } from "@ooneex/container";

// Multiple type imports
import type { ILogger, LogsEntity } from "@ooneex/logger";
```

## Algorithm

```
For each TypeScript file in src/:
  1. Parse all import statements
  2. For each @ooneex/* import:
     - If import starts with "import type" → mark as TYPE_ONLY
     - Else → mark as RUNTIME

For each @ooneex package found:
  - If ANY file has a RUNTIME import → dependencies
  - If ALL files have only TYPE_ONLY imports → devDependencies
```

## Package.json Format

Dependencies should use workspace protocol:

```json
{
  "dependencies": {
    "@ooneex/container": "workspace:*",
    "@ooneex/exception": "workspace:*"
  },
  "devDependencies": {
    "@ooneex/types": "workspace:*"
  }
}
```

## Valid @ooneex Packages

The following package names are valid for imports:

- `ai`, `analytics`, `app`, `app-env`, `auth`, `book`, `cache`, `category`
- `cli`, `color`, `container`, `controller`, `country`, `cron`, `currencies`
- `database`, `education`, `entity`, `exception`, `fetcher`, `folder`, `fs`
- `gamification`, `html`, `http-header`, `http-mimes`, `http-request`
- `http-request-file`, `http-response`, `http-status`, `image`, `jwt`
- `logger`, `mailer`, `middleware`, `migrations`, `module`, `notification`
- `payment`, `pdf`, `permission`, `pub-sub`, `queue`, `rate-limit`, `react`
- `repository`, `role`, `routing`, `seeds`, `service`, `socket`, `status`
- `storage`, `tag`, `translation`, `typeorm`, `types`, `url`, `user`
- `utils`, `validation`, `video`, `youtube`

## Examples

### Example 1: Package with Mixed Imports

Source file `packages/app/src/App.ts`:
```typescript
import type { IAppEnv } from "@ooneex/app-env";
import { container, EContainerScope } from "@ooneex/container";
import type { ICron } from "@ooneex/cron";
import { Exception, type IException } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import type { ScalarType } from "@ooneex/types";
```

Result in `package.json`:
```json
{
  "dependencies": {
    "@ooneex/container": "workspace:*",
    "@ooneex/exception": "workspace:*",
    "@ooneex/http-status": "workspace:*"
  },
  "devDependencies": {
    "@ooneex/app-env": "workspace:*",
    "@ooneex/cron": "workspace:*",
    "@ooneex/types": "workspace:*"
  }
}
```

### Example 2: Package with Only Type Imports

Source file `packages/controller/src/types.ts`:
```typescript
import type { IAnalytics } from "@ooneex/analytics";
import type { IAppEnv } from "@ooneex/app-env";
import type { ICache } from "@ooneex/cache";
```

Result in `package.json`:
```json
{
  "dependencies": {},
  "devDependencies": {
    "@ooneex/analytics": "workspace:*",
    "@ooneex/app-env": "workspace:*",
    "@ooneex/cache": "workspace:*"
  }
}
```

### Example 3: Subpath Imports

Source file with subpath import:
```typescript
import { AssertAppEnv } from "@ooneex/validation/constraints";
```

The base package `@ooneex/validation` should be added to dependencies:
```json
{
  "dependencies": {
    "@ooneex/validation": "workspace:*"
  }
}
```

## Step-by-Step Process

1. **Read the package.json** of the target package
2. **Glob all TypeScript files** in `packages/<name>/src/**/*.ts`
3. **For each file**, extract imports using regex:
   ```
   Type-only: /^import\s+type\s+\{[^}]+\}\s+from\s+["'](@ooneex\/[^"'/]+)/gm
   Runtime: /^import\s+(?!type\s).*from\s+["'](@ooneex\/[^"'/]+)/gm
   ```
4. **Build dependency maps**:
   - `runtimeDeps`: Set of packages with at least one runtime import
   - `typeDeps`: Set of packages with only type imports
5. **Update package.json**:
   - Set `dependencies` to runtime deps (preserving non-@ooneex entries)
   - Set `devDependencies` to type deps (preserving non-@ooneex entries)
6. **Write updated package.json**

## Verification

After syncing, verify:
- Run `bun install` to ensure dependencies resolve
- Run `bun run build` to ensure the package compiles
- Run `bun run lint` to check for import errors

## Edge Cases

### Re-exports
If `src/index.ts` re-exports from another @ooneex package, that's a runtime dependency:
```typescript
export { Container } from "@ooneex/container";  // → dependencies
export type { IContainer } from "@ooneex/container";  // → devDependencies (if no other runtime usage)
```

### Dynamic Imports
Dynamic imports are runtime dependencies:
```typescript
const mod = await import("@ooneex/container");  // → dependencies
```

### Decorators from @ooneex packages
Decorator usage is a runtime dependency since decorators execute at runtime:
```typescript
import { injectable } from "@ooneex/container";

@injectable()  // Runtime usage
class MyClass {}
```

## Output Format

After syncing, report:
```
Synced dependencies for @ooneex/<package>:

Dependencies (runtime):
  + @ooneex/container (added)
  + @ooneex/exception (added)
  ~ @ooneex/logger (moved from devDependencies)

DevDependencies (type-only):
  + @ooneex/types (added)
  - @ooneex/unused (removed)

No changes needed for: @ooneex/http-status
```
