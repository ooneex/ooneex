# @ooneex/validation

A type-safe validation framework powered by ArkType for TypeScript applications. This package provides a robust foundation for data validation with built-in constraints, JSON schema support, and seamless integration with the Ooneex framework.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **ArkType Powered** - Built on the fast and type-safe ArkType validation library

✅ **Built-in Constraints** - Pre-built validators for common use cases (email, URL, port, etc.)

✅ **JSON Schema Support** - Convert schemas to JSON Schema format for documentation

✅ **Custom Error Messages** - Define user-friendly error messages for validation failures

✅ **Type-Safe** - Full TypeScript support with inferred types from schemas

✅ **Extensible** - Create custom validators by extending the base `Validation` class

✅ **Framework Integration** - Works seamlessly with Ooneex routing and controllers

## Installation

### Bun
```bash
bun add @ooneex/validation
```

### pnpm
```bash
pnpm add @ooneex/validation
```

### Yarn
```bash
yarn add @ooneex/validation
```

### npm
```bash
npm install @ooneex/validation
```

## Usage

### Basic Validation with ArkType

```typescript
import { type } from '@ooneex/validation';

// Define a schema
const UserSchema = type({
  name: 'string',
  email: 'string.email',
  age: 'number >= 0'
});

// Validate data
const result = UserSchema({ name: 'John', email: 'john@example.com', age: 25 });

if (result instanceof type.errors) {
  console.error('Validation failed:', result.summary);
} else {
  console.log('Valid user:', result);
}
```

### Using the Validation Class

```typescript
import { Validation, type } from '@ooneex/validation';
import type { AssertType, ValidationResultType } from '@ooneex/validation';

class EmailValidator extends Validation {
  public getConstraint(): AssertType {
    return type('string.email');
  }

  public getErrorMessage(): string | null {
    return 'Please provide a valid email address';
  }
}

const validator = new EmailValidator();
const result = validator.validate('not-an-email');

if (!result.isValid) {
  console.error(result.message); // "Please provide a valid email address"
}
```

### Using Built-in Constraints

```typescript
import {
  AssertEmail,
  AssertPort,
  AssertHostname,
  AssertAppEnv
} from '@ooneex/validation/constraints';

// Validate email
const emailValidator = new AssertEmail();
const emailResult = emailValidator.validate('user@example.com');
console.log(emailResult.isValid); // true

// Validate port number
const portValidator = new AssertPort();
const portResult = portValidator.validate(3000);
console.log(portResult.isValid); // true

// Validate hostname
const hostnameValidator = new AssertHostname();
const hostnameResult = hostnameValidator.validate('0.0.0.0');
console.log(hostnameResult.isValid); // true
```

### Route Validation

```typescript
import { Route } from '@ooneex/routing';
import { type } from '@ooneex/validation';
import type { IController, ContextType } from '@ooneex/controller';

const CreateUserPayload = type({
  name: 'string > 0',
  email: 'string.email',
  password: 'string >= 8'
});

const UserIdParam = type({
  id: 'string.uuid'
});

@Route.http({
  name: 'api.users.create',
  path: '/api/users',
  method: 'POST',
  payload: CreateUserPayload,
  description: 'Create a new user'
})
class UserCreateController implements IController {
  public async index(context: ContextType): Promise<IResponse> {
    // Payload is already validated at this point
    const { name, email, password } = context.payload;
    
    return context.response.json({
      user: { name, email }
    });
  }
}
```

## API Reference

### Re-exports from ArkType

This package re-exports all types and utilities from ArkType:

```typescript
import { type, scope, union, intersection } from '@ooneex/validation';
```

See the [ArkType documentation](https://arktype.io/) for full API reference.

### Classes

#### `Validation`

Abstract base class for creating custom validators.

**Methods:**

##### `abstract getConstraint(): AssertType`

Returns the ArkType schema to validate against.

##### `abstract getErrorMessage(): string | null`

Returns a custom error message or `null` to use the default ArkType error.

##### `validate(data: unknown, constraint?: AssertType): ValidationResultType`

Validates data against the constraint.

**Parameters:**
- `data` - The data to validate
- `constraint` - Optional constraint override

**Returns:** Validation result object

**Example:**
```typescript
class PositiveNumberValidator extends Validation {
  public getConstraint(): AssertType {
    return type('number > 0');
  }

  public getErrorMessage(): string | null {
    return 'Value must be a positive number';
  }
}

const validator = new PositiveNumberValidator();
const result = validator.validate(42);
console.log(result); // { isValid: true }
```

### Functions

#### `Assert`

Utility for quick inline assertions.

```typescript
import { Assert } from '@ooneex/validation';

const isValid = Assert(value, type('string.email'));
```

#### `jsonSchemaToTypeString(schema: object): string`

Converts a JSON Schema to a human-readable type string.

**Parameters:**
- `schema` - JSON Schema object

**Returns:** String representation of the type

**Example:**
```typescript
import { type, jsonSchemaToTypeString } from '@ooneex/validation';

const UserSchema = type({
  name: 'string',
  age: 'number'
});

const jsonSchema = UserSchema.toJsonSchema();
const typeString = jsonSchemaToTypeString(jsonSchema);
console.log(typeString); // "{ name: string, age: number }"
```

### Types

#### `AssertType`

Type alias for ArkType's `Type` definition.

```typescript
import type { AssertType } from '@ooneex/validation';

const schema: AssertType = type('string');
```

#### `IAssert`

Interface for validator classes.

```typescript
interface IAssert {
  getConstraint: () => AssertType;
  getErrorMessage: () => string | null;
  validate: (data: unknown, constraint?: AssertType) => ValidationResultType;
}
```

#### `ValidationResultType`

Result object returned from validation.

```typescript
type ValidationResultType = {
  isValid: boolean;
  message?: string;
};
```

#### `ValidationClassType`

Type for validator class constructors.

```typescript
type ValidationClassType = new (...args: any[]) => IAssert;
```

## Built-in Constraints

Import from `@ooneex/validation/constraints`:

| Constraint | Description |
|------------|-------------|
| `AssertEmail` | Validates email addresses |
| `AssertPort` | Validates port numbers (1-65535) |
| `AssertHostname` | Validates hostnames and IP addresses |
| `AssertAppEnv` | Validates application environment strings |

## Advanced Usage

### Creating Complex Schemas

```typescript
import { type, scope } from '@ooneex/validation';

// Define a scope for related types
const $ = scope({
  user: {
    id: 'string.uuid',
    email: 'string.email',
    profile: 'profile'
  },
  profile: {
    firstName: 'string > 0',
    lastName: 'string > 0',
    age: 'number.integer >= 0',
    bio: 'string | null'
  }
}).export();

// Use the scoped types
const user = $.user({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'john@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    bio: null
  }
});
```

### Union Types

```typescript
import { type } from '@ooneex/validation';

const StatusSchema = type("'pending' | 'active' | 'inactive'");

const result = StatusSchema('active');
console.log(result); // "active"
```

### Array Validation

```typescript
import { type } from '@ooneex/validation';

const TagsSchema = type('string[]');
const NumbersSchema = type('number[] >= 1'); // Array with at least 1 element

const tags = TagsSchema(['typescript', 'validation']);
const numbers = NumbersSchema([1, 2, 3]);
```

### Optional Fields

```typescript
import { type } from '@ooneex/validation';

const UserSchema = type({
  name: 'string',
  email: 'string.email',
  'phone?': 'string', // Optional field
  'age?': 'number >= 0'
});

const user = UserSchema({
  name: 'John',
  email: 'john@example.com'
  // phone and age are optional
});
```

### Custom Validator with Translation

```typescript
import { Validation, type } from '@ooneex/validation';
import type { LocaleType } from '@ooneex/translation';

class LocalizedEmailValidator extends Validation {
  constructor(private readonly locale: LocaleType = 'en') {
    super();
  }

  public getConstraint(): AssertType {
    return type('string.email');
  }

  public getErrorMessage(): string | null {
    const messages: Record<string, string> = {
      en: 'Please enter a valid email address',
      fr: 'Veuillez entrer une adresse email valide',
      es: 'Por favor ingrese una dirección de correo válida'
    };
    
    return messages[this.locale] || messages.en;
  }
}
```

### Converting to JSON Schema

```typescript
import { type } from '@ooneex/validation';

const ProductSchema = type({
  name: 'string',
  price: 'number > 0',
  category: "'electronics' | 'clothing' | 'food'"
});

// Convert to JSON Schema for OpenAPI documentation
const jsonSchema = ProductSchema.toJsonSchema();
console.log(JSON.stringify(jsonSchema, null, 2));
```

### Integration with AI Output Validation

```typescript
import { OpenAi } from '@ooneex/ai';
import { type } from '@ooneex/validation';

const ai = new OpenAi();

const ProductSchema = type({
  name: 'string',
  description: 'string',
  price: 'number > 0'
});

const product = await ai.run('Generate a product', {
  output: ProductSchema
});

// Product is guaranteed to match the schema
console.log(product.name, product.price);
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
