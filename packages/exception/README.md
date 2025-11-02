# @ooneex/exception

A comprehensive TypeScript/JavaScript library for creating structured, HTTP status-aware exceptions. This package provides a robust foundation for error handling in web applications with built-in support for HTTP status codes, structured data, and stack trace parsing.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **HTTP Status Integration** - Built-in support for HTTP status codes via @ooneex/http-status

✅ **Type-Safe** - Full TypeScript support with generic data types

✅ **Structured Data** - Attach custom data objects to exceptions

✅ **Stack Trace Parsing** - Parse stack traces into structured JSON format

✅ **Predefined Exceptions** - Common HTTP exceptions (400, 401, 404, 405)

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Immutable Data** - Exception data is automatically frozen

✅ **Error Wrapping** - Wrap native Error objects with additional context

## Installation

### Bun
```bash
bun add @ooneex/exception
```

### pnpm
```bash
pnpm add @ooneex/exception
```

### Yarn
```bash
yarn add @ooneex/exception
```

### npm
```bash
npm install @ooneex/exception
```

## Usage

### Basic Usage

```typescript
import { Exception } from '@ooneex/exception';

// Simple exception with message
const exception = new Exception('Something went wrong');

console.log(exception.message); // "Something went wrong"
console.log(exception.name); // "Exception"
console.log(exception.date); // Date object

// Exception with HTTP status and data
const detailedException = new Exception('User not found', {
  status: 404,
  data: {
    userId: 123,
    searchCriteria: { email: 'user@example.com' }
  }
});

console.log(detailedException.status); // 404
console.log(detailedException.data); // { userId: 123, searchCriteria: {...} }
```

### Using Predefined Exceptions

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  MethodNotAllowedException
} from '@ooneex/exception';

// 400 Bad Request
throw new BadRequestException('Invalid input data', {
  field: 'email',
  value: 'invalid-email',
  rule: 'Must be a valid email address'
});

// 401 Unauthorized
throw new UnauthorizedException('Token expired', {
  token: 'eyJ...',
  expiredAt: new Date()
});

// 404 Not Found
throw new NotFoundException('Resource not found', {
  resourceType: 'User',
  id: 123
});

// 405 Method Not Allowed
throw new MethodNotAllowedException('POST not allowed on this endpoint', {
  method: 'POST',
  allowedMethods: ['GET', 'PUT']
});
```

### Error Wrapping

```typescript
import { Exception } from '@ooneex/exception';

try {
  // Some operation that might fail
  JSON.parse('invalid json');
} catch (error) {
  // Wrap the native error with additional context
  throw new Exception(error as Error, {
    status: 400,
    data: {
      operation: 'JSON parsing',
      input: 'invalid json'
    }
  });
}
```

### Stack Trace Parsing

```typescript
import { Exception } from '@ooneex/exception';

const exception = new Exception('Parsing failed');
const stackFrames = exception.stackToJson();

console.log(stackFrames);
// [
//   {
//     functionName: 'parseData',
//     fileName: '/path/to/file.ts',
//     lineNumber: 42,
//     columnNumber: 15,
//     source: '    at parseData (/path/to/file.ts:42:15)'
//   },
//   ...
// ]
```

### Generic Data Types

```typescript
import { Exception } from '@ooneex/exception';

// Define custom data interface
interface ValidationError {
  field: string;
  value: unknown;
  rule: string;
  message: string;
}

// Create typed exception
const validationException = new Exception<ValidationError>('Validation failed', {
  status: 400,
  data: {
    field: 'email',
    value: 'not-an-email',
    rule: 'email',
    message: 'Must be a valid email address'
  }
});

// TypeScript ensures type safety
console.log(validationException.data?.field); // string
console.log(validationException.data?.rule); // string
```

## API Reference

### `Exception<T>` Class

The main exception class providing structured error handling with optional HTTP status and custom data.

#### Constructor

```typescript
new Exception<T>(message: string | Error, options?: {
  status?: StatusCodeType;
  data?: T;
})
```

**Parameters:**
- `message` - Error message string or native Error object to wrap
- `options.status` - HTTP status code (from @ooneex/http-status)
- `options.data` - Custom data object (automatically frozen)

#### Properties

##### `date: Date` (readonly)
Timestamp when the exception was created.

```typescript
const exception = new Exception('Error occurred');
console.log(exception.date); // 2024-01-15T10:30:00.000Z
```

##### `status?: StatusCodeType` (readonly)
HTTP status code associated with the exception.

```typescript
const exception = new Exception('Not found', { status: 404 });
console.log(exception.status); // 404
```

##### `data?: T` (readonly)
Custom data object associated with the exception. Automatically frozen to prevent mutations.

```typescript
const exception = new Exception('Error', {
  data: { userId: 123, action: 'delete' }
});
console.log(exception.data); // { userId: 123, action: 'delete' }
// exception.data.userId = 456; // TypeError: Cannot assign to read only property
```

##### `native?: Error` (readonly)
Original native Error object when wrapping existing errors.

```typescript
const originalError = new Error('Original message');
const exception = new Exception(originalError);
console.log(exception.native); // Original Error object
```

##### `message: string`
Error message (inherited from Error).

##### `name: string`
Exception name (inherited from Error).

##### `stack?: string`
Stack trace string (inherited from Error).

#### Methods

##### `stackToJson(): ExceptionStackFrameType[] | null`
Parses the stack trace into a structured JSON format.

**Returns:** Array of stack frame objects or `null` if no stack trace available.

**Example:**
```typescript
const exception = new Exception('Error occurred');
const frames = exception.stackToJson();

if (frames) {
  frames.forEach(frame => {
    console.log(`Function: ${frame.functionName}`);
    console.log(`File: ${frame.fileName}:${frame.lineNumber}:${frame.columnNumber}`);
    console.log(`Source: ${frame.source}`);
  });
}
```

### Predefined Exception Classes

#### `BadRequestException<T>`
HTTP 400 Bad Request exception.

```typescript
new BadRequestException<T>(message: string, data?: T)
```

**Example:**
```typescript
throw new BadRequestException('Invalid request data', {
  validationErrors: ['email is required', 'age must be a number']
});
```

#### `UnauthorizedException<T>`
HTTP 401 Unauthorized exception.

```typescript
new UnauthorizedException<T>(message: string, data?: T)
```

**Example:**
```typescript
throw new UnauthorizedException('Access token expired', {
  tokenType: 'Bearer',
  expiredAt: new Date()
});
```

#### `NotFoundException<T>`
HTTP 404 Not Found exception.

```typescript
new NotFoundException<T>(message: string, data?: T)
```

**Example:**
```typescript
throw new NotFoundException('User not found', {
  userId: 123,
  searchedBy: 'email'
});
```

#### `MethodNotAllowedException<T>`
HTTP 405 Method Not Allowed exception.

```typescript
new MethodNotAllowedException<T>(message: string, data?: T)
```

**Example:**
```typescript
throw new MethodNotAllowedException('DELETE method not allowed', {
  requestedMethod: 'DELETE',
  allowedMethods: ['GET', 'POST', 'PUT']
});
```

### Types and Interfaces

#### `ExceptionStackFrameType`
Represents a single frame in a parsed stack trace.

```typescript
type ExceptionStackFrameType = {
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  source: string;
};
```

#### `IException<T>`
Interface defining the exception contract.

```typescript
interface IException<T = unknown> {
  readonly date: Date;
  readonly status?: StatusCodeType;
  readonly data?: Readonly<Record<string, T>>;
  readonly native?: Error;
  readonly message: string;
  readonly name: string;
  readonly stack?: string;
  stackToJson(): ExceptionStackFrameType[] | null;
}
```

## Advanced Usage

### Custom Exception Classes

```typescript
import { Exception } from '@ooneex/exception';
import { Status } from '@ooneex/http-status';

class PaymentException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: Status.Code.PaymentRequired, // 402
      data
    });
  }
}

// Usage
throw new PaymentException('Insufficient funds', {
  accountBalance: 50.00,
  requiredAmount: 100.00,
  currency: 'USD'
});
```

### Error Serialization

```typescript
import { Exception } from '@ooneex/exception';

const exception = new Exception('Process failed', {
  status: 500,
  data: {
    processId: 'proc-123',
    step: 'validation',
    retryCount: 3
  }
});

// Serialize for logging or API responses
const serialized = JSON.stringify({
  message: exception.message,
  name: exception.name,
  status: exception.status,
  data: exception.data,
  date: exception.date,
  stackFrames: exception.stackToJson()
});

console.log(serialized);
```

### Integration with Express.js

```typescript
import express from 'express';
import { Exception, NotFoundException } from '@ooneex/exception';

const app = express();

app.get('/users/:id', (req, res, next) => {
  const userId = req.params.id;

  // Simulate user lookup
  const user = findUser(userId);
  if (!user) {
    throw new NotFoundException('User not found', {
      userId,
      searchedBy: 'id'
    });
  }

  res.json(user);
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof Exception) {
    res.status(error.status || 500).json({
      error: {
        message: error.message,
        status: error.status,
        data: error.data,
        timestamp: error.date
      }
    });
  } else {
    next(error);
  }
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

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
