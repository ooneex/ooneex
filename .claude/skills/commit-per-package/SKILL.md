---
name: commit-per-package
description: Commit staged changes grouped by package. Use when committing multiple package changes separately, when you need to create atomic commits per package, or after making changes across multiple packages. Analyzes git status and creates properly formatted commits following commitlint conventions.
---

# Commit Per Package

Create separate commits for each modified package, following the project's commitlint conventions.

## Workflow

1. **Analyze staged/unstaged changes**
   - Run `git status --porcelain` to get all modified files
   - Group changes by package (files under `packages/<package-name>/`)
   - Identify root-level changes (files not in packages/) as scope `common`

2. **For each package with changes**
   - Stage only that package's files: `git add packages/<package-name>/`
   - Determine the appropriate commit type based on changes
   - Create a commit with proper format: `type(scope): Subject`
   - Repeat for next package

3. **Handle root-level changes**
   - Files like `bun.lock`, `package.json`, config files use scope `common`
   - Stage and commit separately from package changes

## Commit Message Format

```
type(scope): Subject line
```

### Valid Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no new feature, no bug fix)
- `test`: Adding/updating tests
- `chore`: Maintenance tasks (dependencies, configs)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, whitespace)
- `perf`: Performance improvements
- `build`: Build system changes
- `ci`: CI configuration changes
- `revert`: Revert previous commit

### Valid Scopes
Package names from `packages/` directory:
- `ai`, `analytics`, `app`, `app-env`, `auth`, `book`, `cache`, `category`
- `cli`, `color`, `container`, `controller`, `country`, `cron`, `currencies`
- `database`, `education`, `entities`, `exception`, `fetcher`, `folder`
- `gamification`, `http-header`, `http-mimes`, `http-request`, `http-request-file`
- `http-response`, `http-status`, `image`, `jwt`, `logger`, `mailer`, `mcq`
- `middleware`, `migrations`, `model`, `payment`, `permission`, `pub-sub`
- `queue`, `rate-limit`, `repository`, `role`, `routing`, `seeds`, `service`
- `socket`, `status`, `storage`, `subscription`, `tag`, `translation`
- `typeorm`, `types`, `url`, `user`, `utils`, `validation`, `video`
- `common`: For root-level files (bun.lock, package.json, configs)

### Subject Rules
- Use sentence-case, start-case, pascal-case, or upper-case
- No period at the end
- Maximum 100 characters for entire header
- Use imperative mood ("Add feature" not "Added feature")

## Determining Commit Type

Analyze the changes to determine the appropriate type:

| Change Pattern | Type |
|---------------|------|
| New files with functionality | `feat` |
| Bug fixes, error corrections | `fix` |
| Code restructuring, renaming | `refactor` |
| New/updated test files (`*.spec.ts`) | `test` |
| Documentation files (`*.md`) | `docs` |
| Dependency updates, lock files | `chore` |
| Build configs, scripts | `build` |
| CI/CD files | `ci` |
| Formatting only | `style` |
| Performance optimizations | `perf` |

## Examples

### Example 1: Multiple Package Changes

Git status shows:
```
M packages/cache/src/FilesystemCache.ts
M packages/cache/tests/FilesystemCache.spec.ts
A packages/cache/src/RedisCache.ts
M packages/analytics/src/index.ts
D packages/analytics/src/PostHogAdapter.ts
A packages/analytics/src/PostHogAnalytics.ts
M bun.lock
```

Commands to execute:
```bash
# Commit cache package
git add packages/cache/
git commit -m "feat(cache): Add RedisCache implementation"

# Commit analytics package
git add packages/analytics/
git commit -m "refactor(analytics): Replace PostHogAdapter with PostHogAnalytics"

# Commit root changes
git add bun.lock
git commit -m "chore(common): Update dependencies"
```

### Example 2: Test-only Changes

Git status shows:
```
M packages/validation/tests/Validator.spec.ts
A packages/validation/tests/Schema.spec.ts
```

Command:
```bash
git add packages/validation/
git commit -m "test(validation): Add Schema tests and update Validator tests"
```

### Example 3: Refactoring with Deletions

Git status shows:
```
D packages/service/src/OldService.ts
A packages/service/src/NewService.ts
M packages/service/src/index.ts
```

Command:
```bash
git add packages/service/
git commit -m "refactor(service): Replace OldService with NewService"
```

## Subject Line Guidelines

Write clear, descriptive subjects:

| Good | Bad |
|------|-----|
| `Add Redis caching support` | `redis` |
| `Fix null pointer in validation` | `fix bug` |
| `Update user authentication flow` | `changes` |
| `Remove deprecated API methods` | `cleanup` |
| `Rename PostHogAdapter to PostHogAnalytics` | `rename` |

## Pre-commit Checklist

Before committing, verify:
1. Changes are logically grouped (don't mix unrelated changes)
2. Tests pass for modified packages
3. No debug code or console.logs left in
4. Commit message follows the format exactly

## Handling Special Cases

### Mixed Changes in One Package
If a package has both new features and bug fixes, prioritize:
1. `feat` if primary change is new functionality
2. `fix` if primary change is a bug fix
3. Split into multiple commits if changes are truly independent

### Deleted Files Only
Use `refactor` for removing deprecated code:
```bash
git add packages/cache/
git commit -m "refactor(cache): Remove deprecated RedisCacheAdapter"
```

### Renamed/Moved Files
Use `refactor` for file reorganization:
```bash
git add packages/storage/
git commit -m "refactor(storage): Reorganize adapter file structure"
```
