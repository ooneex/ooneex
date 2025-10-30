# @ooneex/container

A lightweight and type-safe dependency injection container for TypeScript/JavaScript applications. Built on top of Inversify, this package provides a simplified API for managing dependencies with support for different scoping strategies and constant value injection.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Multiple Scopes** - Support for Singleton, Transient, and Request scopes

✅ **Constant Injection** - Register and inject constant values using string or symbol identifiers

✅ **Simple API** - Clean and intuitive methods for dependency management

✅ **Built on Inversify** - Leverages the robust Inversify container under the hood

✅ **Lightweight** - Minimal overhead with focused functionality

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Service Management** - Easy registration, retrieval, and removal of services

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

### Basic Usage

```typescript
import { Container, EContainerScope } from '@ooneex/container';

const container = new Container();

// Define a service
class DatabaseService {
  public connect(): string {
    return 'Connected to database';
  }
}

// Register the service
container.add(DatabaseService);

// Retrieve the service
const dbService = container.get(DatabaseService);
console.log(dbService.connect()); // "Connected to database"
```

### Different Scopes

```typescript
import { Container, EContainerScope } from '@ooneex/container';

const container = new Container();

class CounterService {
  private static count = 0;
  public readonly id: number;

  constructor() {
    CounterService.count++;
    this.id = CounterService.count;
  }

  public getId(): number {
    return this.id;
  }
}

// Singleton scope (default) - same instance every time
container.add(CounterService, EContainerScope.Singleton);
const instance1 = container.get(CounterService);
const instance2 = container.get(CounterService);
console.log(instance1.getId() === instance2.getId()); // true

// Transient scope - new instance every time
container.add(CounterService, EContainerScope.Transient);
const instance3 = container.get(CounterService);
const instance4 = container.get(CounterService);
console.log(instance3.getId() !== instance4.getId()); // true
```

### Working with Constants

```typescript
import { Container } from '@ooneex/container';

const container = new Container();

// Register constants
const API_KEY = Symbol('API_KEY');
const DATABASE_URL = 'database_url';

container.addConstant(API_KEY, 'your-api-key-here');
container.addConstant(DATABASE_URL, 'postgresql://localhost:5432/mydb');

// Retrieve constants
const apiKey = container.getConstant<string>(API_KEY);
const dbUrl = container.getConstant<string>(DATABASE_URL);

console.log(apiKey); // "your-api-key-here"
console.log(dbUrl); // "postgresql://localhost:5432/mydb"

// Use constants in services
class ApiService {
  public getEndpoint(): string {
    const apiKey = container.getConstant<string>(API_KEY);
    return `https://api.example.com?key=${apiKey}`;
  }
}
```

### Advanced Usage

```typescript
import { Container, EContainerScope } from '@ooneex/container';

const container = new Container();

// Configuration constants
const DB_CONFIG = Symbol('DB_CONFIG');
interface DbConfig {
  host: string;
  port: number;
}

const dbConfig: DbConfig = {
  host: 'localhost',
  port: 5432
};

container.addConstant(DB_CONFIG, dbConfig);

// Service with dependencies
class DatabaseService {
  public connect(): string {
    const config = container.getConstant<DbConfig>(DB_CONFIG);
    return `Connected to ${config.host}:${config.port}`;
  }
}

class UserService {
  private database: DatabaseService;

  constructor() {
    this.database = container.get(DatabaseService);
  }

  public createUser(name: string): string {
    const dbResult = this.database.connect();
    return `User ${name} created. ${dbResult}`;
  }
}

// Register services
container.add(DatabaseService);
container.add(UserService);

// Use the service
const userService = container.get(UserService);
console.log(userService.createUser('John'));
// "User John created. Connected to localhost:5432"
```

## API Reference

### `Container` Class

The main dependency injection container class.

#### Methods

##### `add(target: Constructor, scope?: EContainerScope): void`
Registers a service class in the container.

**Parameters:**
- `target` - The constructor function of the service class
- `scope` - Optional scope for the service (defaults to Singleton)

**Example:**
```typescript
class MyService {
  getValue(): string {
    return 'Hello World';
  }
}

container.add(MyService); // Singleton scope
container.add(MyService, EContainerScope.Transient); // Transient scope
container.add(MyService, EContainerScope.Request); // Request scope
```

##### `get<T>(target: Constructor<T>): T`
Retrieves an instance of a registered service.

**Parameters:**
- `target` - The constructor function of the service class

**Returns:** Instance of the requested service

**Throws:** Error if the service is not registered

**Example:**
```typescript
const service = container.get(MyService);
console.log(service.getValue()); // "Hello World"
```

##### `has(target: Constructor): boolean`
Checks if a service is registered in the container.

**Parameters:**
- `target` - The constructor function to check

**Returns:** `true` if registered, `false` otherwise

**Example:**
```typescript
console.log(container.has(MyService)); // true
console.log(container.has(UnregisteredService)); // false
```

##### `remove(target: Constructor): void`
Removes a service registration from the container.

**Parameters:**
- `target` - The constructor function of the service to remove

**Example:**
```typescript
container.remove(MyService);
console.log(container.has(MyService)); // false
```

##### `addConstant<T>(identifier: string | symbol, value: T): void`
Registers a constant value in the container.

**Parameters:**
- `identifier` - String or Symbol identifier for the constant
- `value` - The constant value to store

**Example:**
```typescript
const API_URL = Symbol('API_URL');
container.addConstant(API_URL, 'https://api.example.com');
container.addConstant('version', '1.0.0');
```

##### `getConstant<T>(identifier: string | symbol): T`
Retrieves a constant value from the container.

**Parameters:**
- `identifier` - String or Symbol identifier of the constant

**Returns:** The stored constant value

**Throws:** Error if the constant is not registered

**Example:**
```typescript
const apiUrl = container.getConstant<string>(API_URL);
const version = container.getConstant<string>('version');
```

##### `hasConstant(identifier: string | symbol): boolean`
Checks if a constant is registered in the container.

**Parameters:**
- `identifier` - String or Symbol identifier to check

**Returns:** `true` if registered, `false` otherwise

**Example:**
```typescript
console.log(container.hasConstant(API_URL)); // true
console.log(container.hasConstant('unknown')); // false
```

##### `removeConstant(identifier: string | symbol): void`
Removes a constant registration from the container.

**Parameters:**
- `identifier` - String or Symbol identifier of the constant to remove

**Example:**
```typescript
container.removeConstant(API_URL);
console.log(container.hasConstant(API_URL)); // false
```

### `EContainerScope` Enum

Defines the available scoping strategies for services.

#### Values

##### `EContainerScope.Singleton`
**Default scope.** Creates a single instance that is reused for all requests.

**Example:**
```typescript
container.add(MyService, EContainerScope.Singleton);
const instance1 = container.get(MyService);
const instance2 = container.get(MyService);
console.log(instance1 === instance2); // true
```

##### `EContainerScope.Transient`
Creates a new instance every time the service is requested.

**Example:**
```typescript
container.add(MyService, EContainerScope.Transient);
const instance1 = container.get(MyService);
const instance2 = container.get(MyService);
console.log(instance1 === instance2); // false
```

##### `EContainerScope.Request`
Creates one instance per request scope. In most contexts, behaves like Singleton.

**Example:**
```typescript
container.add(MyService, EContainerScope.Request);
```

### `IContainer` Interface

Interface defining the container contract.

**Example:**
```typescript
import { IContainer, EContainerScope } from '@ooneex/container';

class CustomContainer implements IContainer {
  add(target: Constructor, scope?: EContainerScope): void {
    // Custom implementation
  }

  get<T>(target: Constructor<T>): T {
    // Custom implementation
  }

  // ... implement other methods
}
```

## Shared Container State

**Important:** The container uses a shared Inversify container instance under the hood. This means that all `Container` instances share the same service registrations.

```typescript
import { Container } from '@ooneex/container';

const container1 = new Container();
const container2 = new Container();

class SharedService {
  getValue(): string {
    return 'shared';
  }
}

// Register in first container
container1.add(SharedService);

// Available in second container too
console.log(container2.has(SharedService)); // true
const service = container2.get(SharedService);
console.log(service.getValue()); // "shared"
```

## Best Practices

### 1. Use Symbols for Constants
```typescript
// Good
const API_KEY = Symbol('API_KEY');
container.addConstant(API_KEY, 'your-key');

// Avoid string keys when possible
container.addConstant('api_key', 'your-key');
```

### 2. Define Interfaces
```typescript
interface IUserRepository {
  findUser(id: string): User | null;
}

class UserRepository implements IUserRepository {
  findUser(id: string): User | null {
    // Implementation
  }
}
```

### 3. Use Appropriate Scopes
- **Singleton**: For stateless services, configurations, connections
- **Transient**: For stateful services that need fresh instances
- **Request**: For services that should be scoped to a request lifecycle

### 4. Handle Dependencies Manually
Since this is a simple container, inject dependencies in constructors:

```typescript
class UserService {
  private userRepo: IUserRepository;
  private logger: ILogger;

  constructor() {
    this.userRepo = container.get(UserRepository);
    this.logger = container.get(Logger);
  }
}
```

## Error Handling

The container will throw errors in the following scenarios:

- Attempting to get an unregistered service
- Attempting to get an unregistered constant

```typescript
try {
  const service = container.get(UnregisteredService);
} catch (error) {
  console.error('Service not found:', error.message);
}

try {
  const value = container.getConstant('unknown');
} catch (error) {
  console.error('Constant not found:', error.message);
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun test`
4. Build the project: `bun run build`

### Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---

Made with ❤️ by the Ooneex team
