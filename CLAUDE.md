# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ooneex is a TypeScript monorepo framework built on Bun runtime, consisting of 50+ independent packages published under the `@ooneex` namespace. The framework provides a comprehensive set of tools for building web applications with dependency injection, routing, database management, caching, authentication, and more.

## Development Commands

### Building
```bash
bun run build              # Build all packages
bunx nx run-many -t build  # Alternative build command
bunx nx graph              # Visualize dependency graph
bunx nx graph --affected   # Show affected projects
```

### Testing
```bash
bun run test                           # Run tests for all packages
bun test tests                         # Run tests in a specific package
bun test packages/[package-name]/tests # Run tests for specific package
```

### Linting and Formatting
```bash
bun run fmt   # Format code with Biome
bun run lint  # Lint all packages with Biome and TypeScript
```

### Development
```bash
bun run dev  # Watch mode - rebuilds all packages on change
```

### Publishing
```bash
bun run publish  # Publish all packages to npm
```

## Architecture

### Monorepo Structure

This is an Nx-powered monorepo using Bun workspaces. All packages live in `packages/` and are published independently with the prefix `@ooneex/`. The monorepo uses:

- **Package Manager**: Bun
- **Build Tool**: bunup (custom tool)
- **Monorepo Tool**: Nx with independent package versioning
- **Linter/Formatter**: Biome
- **Test Runner**: Bun test

### Dependency Injection System

The framework uses a centralized DI container based on InversifyJS:

- **Container Package** (`@ooneex/container`): Provides the core `Container` class with a shared singleton InversifyJS instance across the entire application
- **Decorator Pattern**: Each package provides its own decorators that register classes with the container
- **Scopes**: Singleton (default), Request, and Transient scopes are supported via `EContainerScope`

Key architectural components using DI:
- **Services**: Classes ending with `Service` decorated with `@decorator.service()`
- **Repositories**: Classes ending with `Repository` decorated with `@decorator.repository()`
- **Middlewares**: Classes ending with `Middleware` decorated with `@decorator.middleware()`
- **Controllers**: Classes decorated with controller-specific decorators

### Package Dependencies

Core packages that other packages depend on:
- `@ooneex/container`: DI container (used by almost all packages)
- `@ooneex/exception`: Base exception classes with HTTP status codes
- `@ooneex/types`: Shared TypeScript types
- `@ooneex/http-status`: HTTP status code definitions

Application layer packages:
- `@ooneex/app`: Main application orchestrator
- `@ooneex/routing`: Routing system
- `@ooneex/controller`: Controller base classes

### TypeScript Configuration

The project uses strict TypeScript settings:
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Strict mode with additional checks (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Module system: ESNext with bundler resolution
- Target: ES2022

### Exception Handling

All packages define their own exception classes extending `Exception` from `@ooneex/exception`. Exceptions include:
- HTTP status codes
- Structured error data
- JSON-formatted stack traces via `stackToJson()`

## Commit Conventions

The project uses commitlint with conventional commits. **ALL commits MUST follow this format:**

```
type(scope): Subject line

[optional body]

[optional footer]
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `style`: Code style changes
- `perf`: Performance improvements
- `build`: Build system changes
- `ci`: CI configuration changes
- `revert`: Revert previous commit

### Commit Scopes
Required scopes match package names (e.g., `analytics`, `cache`, `container`, `service`, `repository`) or use `common` for repository-wide changes. See `.commitlintrc.ts` for the complete list of valid scopes.

### Commit Rules
- Scope is **required** (never empty)
- Subject must be sentence-case, start-case, pascal-case, or upper-case
- No period at end of subject
- Max header length: 100 characters
- Max body line length: 100 characters

### Examples
```bash
feat(service): Add decorators and tests
refactor(container): Remove decorators module
chore(common): Update bun.lock dependencies
```

## CLI Templates

The `@ooneex/cli` package provides code generation templates for common patterns. Templates are located in `packages/cli/src/templates/` and include:
- `service.txt`: Service class template
- `repository.txt`: Repository class template
- `middleware.txt`: Middleware class template
- `cache.txt`, `analytics.txt`, `storage.txt`, etc.

All templates use the naming convention pattern and decorator registration.

## Naming Conventions

**Strictly enforced** by decorators:
- Services: Must end with `Service`
- Repositories: Must end with `Repository`
- Middlewares: Must end with `Middleware`
- Controllers: Follow controller-specific patterns

Breaking these conventions will throw a `ContainerException` at registration time.

## Testing

- Tests are located in `tests/` directory within each package
- Test files use `.spec.ts` suffix
- Run tests with `bun test tests` in package directory
- Recently added decorator tests can be found in `tests/decorators.spec.ts`

## Key Files

- `nx.json`: Nx configuration with build targets, release settings, and dependency rules
- `tsconfig.json`: TypeScript compiler options
- `.commitlintrc.ts`: Commit message linting rules and scopes
- `biome.jsonc`: Code formatting and linting configuration
- `package.json`: Root workspace configuration with scripts
