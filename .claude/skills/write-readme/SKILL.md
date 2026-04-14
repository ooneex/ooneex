---
name: write-readme
description: Generate comprehensive README.md files for @ooneex packages. Use when creating documentation for new packages, updating existing READMEs, or when asked to document a package. Follows the standard README structure used across the monorepo.
---

# Write README

Generate comprehensive README.md documentation for @ooneex packages following the established structure and conventions.

## README Structure

Every package README must follow this structure:

```markdown
# @ooneex/{package-name}

{Brief description of the package - 2-3 sentences explaining what it does and its main purpose}

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

{List of features with checkmarks}

## Installation

{Installation instructions for Bun only}

## Usage

{Usage examples with code blocks}

## API Reference

{Detailed API documentation}

## Advanced Usage

{Complex examples and patterns}

## License

{License information}

## Contributing

{Contributing guidelines}
```

## Workflow

1. **Identify the target package**
   - Get the package name from user or context
   - Read the package.json to understand dependencies and purpose

2. **Analyze package source code**
   - Read all TypeScript files in `packages/<package-name>/src/`
   - Identify exported classes, functions, types, and interfaces
   - Understand the main functionality and use cases

3. **Gather context**
   - Check for existing tests to understand usage patterns
   - Look at how other packages use this package
   - Identify key interfaces and types

4. **Generate README sections**
   - Write each section following the structure below

## Section Details

### Title and Description

```markdown
# @ooneex/{package-name}

{1-3 sentences describing the package purpose, main features, and target use cases}
```

The description should:
- Start with "A" or "An" for grammatical consistency
- Mention the primary functionality
- Highlight key benefits (type-safe, lightweight, etc.)

### Badges

Always include these badges (adjust compatibility based on package):

```markdown
![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
```

### Features Section

List features with checkmarks. Each feature should be:
- Concise (2-6 words)
- Bolded title with brief explanation

```markdown
## Features

✅ **Feature Name** - Brief description of the feature

✅ **Another Feature** - What this feature provides

✅ **Type-Safe** - Full TypeScript support with proper type definitions
```

Common features to consider:
- Type safety
- Cross-platform compatibility
- Dependency injection support
- Error handling
- Performance characteristics
- Integration capabilities

### Installation Section

Always use this exact format (Bun only):

```markdown
## Installation

\`\`\`bash
bun add @ooneex/{package-name}
\`\`\`
```

### Usage Section

Provide practical examples organized by use case:

```markdown
## Usage

### Basic Usage

\`\`\`typescript
import { MainClass } from '@ooneex/{package-name}';

// Simple example
const instance = new MainClass();
const result = instance.doSomething();
console.log(result);
\`\`\`

### With Configuration

\`\`\`typescript
import { MainClass, type IConfig } from '@ooneex/{package-name}';

const config: IConfig = {
  option1: 'value',
  option2: true
};

const instance = new MainClass(config);
\`\`\`
```

Guidelines:
- Start with the simplest possible example
- Progress to more complex use cases
- Include TypeScript types in examples
- Show real-world scenarios
- Include expected output in comments

### API Reference Section

Document each exported function, class, and type:

```markdown
## API Reference

### Classes

#### `ClassName`

Description of the class and its purpose.

**Constructor:**
\`\`\`typescript
new ClassName(options?: IClassOptions)
\`\`\`

**Parameters:**
- `options` - Optional configuration object

**Methods:**

##### `methodName(param: Type): ReturnType`

Description of what this method does.

**Parameters:**
- `param` - Description of the parameter

**Returns:** Description of return value

**Example:**
\`\`\`typescript
const instance = new ClassName();
const result = instance.methodName('value');
\`\`\`

### Functions

#### `functionName(param: Type): ReturnType`

Description of the function.

**Parameters:**
- `param` - Description

**Returns:** Description

**Example:**
\`\`\`typescript
const result = functionName('input');
\`\`\`

### Types

#### `IInterfaceName`

\`\`\`typescript
interface IInterfaceName {
  property1: string;
  property2: number;
  optionalProperty?: boolean;
}
\`\`\`

### Enums

#### `EEnumName`

| Value | Description |
|-------|-------------|
| `VALUE_ONE` | Description of this value |
| `VALUE_TWO` | Description of this value |
```

### Advanced Usage Section

Show complex patterns and integrations:

```markdown
## Advanced Usage

### Integration with Dependency Injection

\`\`\`typescript
import { Container } from '@ooneex/container';
import { MainClass } from '@ooneex/{package-name}';

// Register with container
Container.bind(MainClass).toSelf();

// Resolve instance
const instance = Container.get(MainClass);
\`\`\`

### Custom Configuration

\`\`\`typescript
// Complex configuration example
\`\`\`

### Error Handling

\`\`\`typescript
import { PackageException } from '@ooneex/{package-name}';

try {
  // Operation that might fail
} catch (error) {
  if (error instanceof PackageException) {
    console.error(error.message);
    console.error(error.data);
  }
}
\`\`\`
```

### License Section

```markdown
## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
```

### Contributing Section

```markdown
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun run test`
4. Build the project: `bun run build`

### Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

Made with ❤️ by the Ooneex team
```

## Package Analysis Checklist

Before writing the README:

1. **Read package.json**
   - Get package name and description
   - Identify dependencies
   - Check for peer dependencies

2. **Analyze src/index.ts**
   - List all exports
   - Identify main classes and functions
   - Note re-exports from other files

3. **Read main source files**
   - Understand class structure
   - Document public methods
   - Note constructor parameters

4. **Check types.ts (if exists)**
   - Document interfaces
   - Document enums
   - Note type aliases

5. **Review tests (if available)**
   - Understand usage patterns
   - Extract example code
   - Identify edge cases

## Example: Complete README

For a hypothetical `@ooneex/cache` package:

```markdown
# @ooneex/cache

A high-performance, type-safe caching library for TypeScript applications. This package provides a unified interface for various caching strategies including in-memory, Redis, and file-based caching with built-in TTL support and cache invalidation.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Multiple Backends** - Support for memory, Redis, and file-based caching

✅ **TTL Support** - Automatic expiration with configurable time-to-live

✅ **Type-Safe** - Full TypeScript support with generic cache values

✅ **Decorator Support** - Use `@decorator.cache()` for automatic method caching

✅ **Cache Invalidation** - Flexible invalidation strategies and patterns

✅ **Serialization** - Automatic JSON serialization for complex objects

## Installation

\`\`\`bash
bun add @ooneex/cache
\`\`\`

## Usage

### Basic Caching

\`\`\`typescript
import { Cache } from '@ooneex/cache';

const cache = new Cache();

// Set a value
await cache.set('user:123', { name: 'John', age: 30 });

// Get a value
const user = await cache.get<{ name: string; age: number }>('user:123');
console.log(user); // { name: 'John', age: 30 }

// Delete a value
await cache.delete('user:123');
\`\`\`

### With TTL

\`\`\`typescript
import { Cache } from '@ooneex/cache';

const cache = new Cache();

// Cache for 5 minutes
await cache.set('session:abc', { token: 'xyz' }, { ttl: 300 });

// Check if key exists
const exists = await cache.has('session:abc');
console.log(exists); // true
\`\`\`

## API Reference

### Classes

#### `Cache`

Main caching class providing get, set, delete, and invalidation methods.

**Constructor:**
\`\`\`typescript
new Cache(options?: ICacheOptions)
\`\`\`

**Methods:**

##### `get<T>(key: string): Promise<T | null>`

Retrieves a cached value by key.

##### `set<T>(key: string, value: T, options?: ISetOptions): Promise<void>`

Stores a value in the cache.

##### `delete(key: string): Promise<boolean>`

Removes a value from the cache.

##### `has(key: string): Promise<boolean>`

Checks if a key exists in the cache.

##### `clear(): Promise<void>`

Clears all cached values.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Clone the repository
2. Install dependencies: \`bun install\`
3. Run tests: \`bun run test\`
4. Build the project: \`bun run build\`

### Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

Made with ❤️ by the Ooneex team
\`\`\`

## Output

When generating a README, save it to:
```
packages/<package-name>/README.md
```

Report completion:
```
Generated README.md for @ooneex/<package-name>

Sections included:
- Title and description
- Badges (6)
- Features (X items)
- Installation (Bun)
- Usage (X examples)
- API Reference (X classes, X functions, X types)
- Advanced Usage (X examples)
- License
- Contributing

File: packages/<package-name>/README.md
```
