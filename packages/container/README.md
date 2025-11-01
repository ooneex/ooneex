# @ooneex/container

A powerful and lightweight Dependency Injection (DI) container for TypeScript/JavaScript applications. Built on top of Inversify, this package provides a simple yet comprehensive API for managing service dependencies and constants with different scoping strategies.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Service Registration** - Register classes and resolve dependencies automatically


✅ **Multiple Scopes** - Singleton, Transient, and Request scoping support

✅ **Constant Management** - Store and retrieve constants with string or symbol identifiers

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Lightweight** - Minimal overhead with powerful dependency injection

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Error Handling** - Comprehensive error reporting
 with ContainerException

✅ **Service Lifecycle** - Complete control over service creation and removal

✅ **Symbol Support** - Use symbols as identifiers for constants and services

## Installation

### Bun
```bash
bun add @ooneex/container
```

### pnpm
```bash
pnpm add @ooneex/container
```

### Yarn
```bash
yarn add @ooneex/container
```

### npm
```bash
npm install @ooneex/container
```

## Usage

### Basic Service Registration

```typescript
import { Container, EContainerScope } from '@ooneex/container';

const container = new Container();

class DatabaseService {
  public connect(): string {
    return "Connected to database";
  }
}

class UserService {
  private database: DatabaseService;

  constructor() {
    this.database = container.get(DatabaseService);
  }

  public createUser(name: string): string {
    this.database.connect();
    return `User ${name} created`;
  }
}

// Register services
container.add(DatabaseService);
container.add(UserService);

// Resolve an
d use services
const userService = container.get(UserService);
console.log(userService.createUser("John")); // "User John created"
```

### Scoping Strategies

```typescript
import { Container, EContainerScope } from '@ooneex/container';

const container = new Container();

class SingletonService {
  private static instanceCount = 0;
  public readonly instanceId: number;

  constructor() {
    this.instanceId = ++SingletonService.instanceCount;
  }
}

class TransientService {
  private static instanceCount = 0;
  public readonly instanceId: number;

  constructor() {
    this.instanceId = ++TransientService.instanceCount;
  }
}

// Singleton scope (default) - same instance every time
container.add(SingletonService, EContainerScope.Singleton);
const singleton1 = container.get(SingletonService);
const singleton2 = container.get(SingletonService);
console.log(singleton1.instanceId === singleton2.instanceId); // true

// Transient scope - new instance every time
container.add(TransientService, EContainerScope.Transient);
const transient1 = container.get(TransientService);
const transient2 = container.get(TransientService);
console.log(transient1.instanceId !== transient2.instanceId); // true
```

### Constants Management

```typescript
import { Container } from '@ooneex/container';

const container = new Container();

// String-based constants
container.addConstant("API_URL", "https://api.example.com");
container.addConstant("MAX_RETRIES", 3);

// Symbol-based constants
const DATABASE_CONFIG = Symbol("database-config");
const dbConfig = {
  host: "localhost",
  port: 5432,
  database: "myapp"
};

container.addConstant(DATABASE_CONFIG, dbConfig);

// Retrieve constants
const apiUrl = container.getConstant<string>("API_URL");
const maxRetries = container.getConstant<number>("MAX_RETRIES");
const config = container.getConstant<typeof dbConfig>(DATABASE_CONFIG);

console.log(apiUrl); // "https://api.example.com"
console.log(maxRetries); // 3
console.log(config.host); // "localhost"
```

### Advanced Usage with Mixed Dependencies

```typescript
import { Container } from '@ooneex/container';

const container = new Container();

const DB_CONFIG = Symbol("db-config");
const API_URL = "API_URL";

interface DatabaseConfig {
  host: string;
  port: number;
}

class ApiService {
  public getEndpoint(): string {
    const apiUrl = container.getConstant<string>(API_URL);
    return `${apiUrl}/users`;
  }
}

class DatabaseService {
  public connect(): string {
    const config = container.getConstant<DatabaseConfig>(DB_CONFIG);
    return `Connected to ${config.host}:${config.port}`;
  }
}

class UserService {
  private api: ApiService;
  private db: DatabaseService;

  constructor() {
    this.api = container.get(ApiService);
    this.db = container.get(DatabaseService);
  }

  public processUser(): string {
    const endpoint = this.api.getEndpoint();
    const connection = this.db.connect();
    return `Processing user via ${endpoint} with ${connection}`;
  }
}

// Register constants
container.addConstant(DB_CONFIG, { host: "localhost", port: 5432 });
container.addConstant(API_URL, "https://api.example.com");

// Register services
container.add(ApiService);
container.add(DatabaseService);
container.add(UserService);

// Use the services
const userService = container.get(UserService);
console.log(userService.processUser());
```

## API Reference

### `Container` Class

The main dependency injection container class.

#### Service Methods

##### `add(target: Constructor, scope?: EContainerScope): void`
Registers a class constructor in the container with optional scoping.

**Parameters:**
- `target` - The class constructor to register
- `scope` - The lifecycle scope (default: `EContainerScope.Singleton`)

**Example:**
```typescript
container.add(DatabaseService);
container.add(LoggerService, EContainerScope.Transient);
container.add(RequestService, EContainerScope.Request);
```

##### `get<T>(target: Constructor<T>): T`
Resolves and returns an instance of the registered class.

**Parameters:**
- `target` - The class constructor to resolve

**Returns:** Instance of the requested class

**Throws:** `ContainerException` if the service is not registered

**Example:**
```typescript
const service = container.get(DatabaseService);
service.connect();
```

##### `has(target: Constructor): boolean`
Checks if a service is registered in the container.

**Parameters:**
- `target` - The class constructor to check

**Returns:** `true` if registered, `false` otherwise

**Example:**
```typescript
if (container.has(DatabaseService)) {
  const db = container.get(DatabaseService);
}
```

##### `remove(target: Constructor): void`
Removes a service registration from the container.

**Parameters:**
- `target` - The class constructor to remove

**Example:**
```typescript
container.remove(DatabaseService);
console.log(container.has(DatabaseService)); // false
```

#### Constants Methods

##### `addConstant
<T>(identifier: string | symbol, value: T): void`
Registers a constant value in the container.

**Parameters:**
- `identifier` - String or symbol identifier for the constant
- `value` - The constant value to store

**Example:**
```typescript
container.addConstant("API_KEY", "secret-key-123");
const CONFIG_SYMBOL = Symbol("config");
container.addConstant(CONFIG_SYMBOL, { env: "production" });
```

##### `getConstant<T>(identifier: string | symbol): T`
Retrieves a constant value from the container.

**Parameters:**
- `identifier` - String or symbol identifier for the constant

**Returns:** The stored constant value

**Throws:** `ContainerException` if the constant is not found

**Example:**
```typescript
const apiKey = container.getConstant<string>("API_KEY");
const config = container.getConstant<Config>(CONFIG_SYMBOL);
```

##### `hasConstant(identifier: string | symbol): boolean`
Checks if a constant is registered in the container.

**Parameters:**
- `identifier` - String or symbol identifier to check

**Returns:** `true` if the constant exists, `false` otherwise

**Example:**
```typescript
if (container.hasConstant("API_KEY")) {
  const key = container.getConstant<string>("API_KEY");
}
```

##### `removeConstant(identifier: string | symbol): void`
Removes a constant from the container.

**Parameters:**
- `identifier` - String or symbol identifier to remove

**Example:**
```typescript
container.removeConstant("API_KEY");
console.log(container.hasConstant("API_KEY")); // false
```

### `EContainerScope` Enum

Defines the lifecycle
 scopes for service instances.

#### Values

##### `EContainerScope.Singleton`
Creates a single instance that is reused for all requests (default behavior).

**Example:**
```typescript
container.add(DatabaseService, EContainerScope.Singleton);
```

##### `EContainerScope.Transient`
Creates a new instance for every request.

**Example:**
```typescript
container.add(RequestIdService, EContainerScope.Transient);
```

##### `EContainerScope.Request`
Creates one instance per request scope (useful in web applications).

**Example:**
```typescript
container.add(UserContextService, EContainerScope.Request);
```

### `IContainer` Interface

Interface defining the contract for dependency injection containers.

**Example:**
```typescript
import { IContainer } from '@ooneex/container';

class CustomContainer implements IContainer {
  // Implement all required methods
  add(target: Constructor, scope?: EContainerScope): void {
    // Custom implementation
  }

  get<T>(target: Constructor<T>): T {
    // Custom implementation
  }

  // ... other methods
}
```

### `ContainerException` Class

Exception thrown when container operations fail.

**Properties:**
- Extends the base `Exception` class from `@ooneex/exception`
- Contains detailed error information and context
- HTTP status code set to `500 Internal Server Error`

**Example:**
```typescript
try {
  const service = container.get(UnregisteredService);
} catch (error) {
  if (error instanceof ContainerException) {
    console.log(error.message); // "Failed to resolve dependency: UnregisteredService"
    console.log(error.status); // 500
  }
}
```

## Error Handling

The container provides comprehensive error handling through the `ContainerException` class:

```typescript
import { Container, ContainerException } from '@ooneex/container';

const container = new Container();

// Service not registered
try {
  const service = container.get(UnknownService);
} catch (error) {
  if (error instanceof ContainerException) {
    console.log(`Service error: ${error.message}`);
  }
}

// Constant not found
try {
  const value = container.getConstant("MISSING_CONSTANT");
} catch (error) {
  if (error instanceof ContainerException) {
    console.log(`Constant error: ${error.message}`);
  }
}
```

## Best Practices

### 1. Use Symbols for Internal Constants
```typescript
// Use symbols to avoid naming conflicts
const DATABASE_CONFIG = Symbol("database-config");
container.addConstant(DATABASE_CONFIG, config);
```

### 2. Check Registration Before Use
```typescript
if (!container.has(OptionalService)) {
  container.add(OptionalService);
}
```

### 3. Handle Exceptions Gracefully
```typescript
try {
  const service = container.get(CriticalService);
  return service.process();
} catch (error) {
  if (error instanceof ContainerException) {
    // Log error and provide fallback
    console.error("Service unavailable:", error.message);
    return defaultResult;
  }
  throw error;
}
```

### 4. Use Appropriate Scoping
```typescript
// Singleton for shared resources
container.add(DatabaseConnection, EContainerScope.Singleton);

// Transient for stateful services
container.add(UserSession, EContainerScope.Transient);

// Request scope for web request context
container.add(RequestContext, EContainerScope.Request);
```

### 5. Organize Dependencies
```typescript
// Group related services and constants
const setupDatabase = (container: Container) => {
  const DB_CONFIG = Symbol("db-config");
  container.addConstant(DB_CONFIG, databaseConfig);
  container.add(DatabaseService);
  container.add(UserRepository);
};

const setupApi = (container: Container) => {
  container.addConstant("API_BASE_URL", process.env.API_URL);
  container.add(ApiClient);
  container.add(AuthService);
};
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Copyright

Copyright (c) 2025 Ooneex

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

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
