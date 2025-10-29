# @ooneex/utils

A comprehensive TypeScript/JavaScript utility library providing essential helper functions for modern web development. This package includes string manipulation, time formatting, data conversion, and other commonly needed utilities.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **String Manipulation** - Case conversion, word splitting, and capitalization

✅ **Time Utilities** - Format seconds/milliseconds to human-readable formats

✅ **Data Conversion** - Parse strings to appropriate types, DataURL to File conversion

✅ **Random Generation** - Generate random IDs and strings with customizable patterns

✅ **Environment Parsing** - Parse environment variables with type safety

✅ **Number Formatting** - Format numbers with internationalization support

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Lightweight** - Minimal dependencies and optimized bundle size

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Zero Config** - Works out of the box with sensible defaults

## Installation

### Bun
```bash
bun add @ooneex/utils
```

### pnpm
```bash
pnpm add @ooneex/utils
```

### Yarn
```bash
yarn add @ooneex/utils
```

### npm
```bash
npm install @ooneex/utils
```

## Usage

### String Utilities

```typescript
import {
  capitalizeWord,
  toCamelCase,
  toPascalCase,
  toKebabCase,
  splitToWords,
  trim
} from '@ooneex/utils';

// Capitalize words
console.log(capitalizeWord('hello')); // 'Hello'
console.log(capitalizeWord('WORLD')); // 'World'

// Case conversions
console.log(toCamelCase('hello world')); // 'helloWorld'
console.log(toPascalCase('hello world')); // 'HelloWorld'
console.log(toKebabCase('Hello World')); // 'hello-world'

// Split strings into words
console.log(splitToWords('hello-world_example')); // ['hello', 'world', 'example']

// Advanced trimming
console.log(trim('  hello world  ')); // 'hello world'
console.log(trim('[hello]', '\\[|\\]')); // 'hello'
```

### Time Formatting

```typescript
import {
  secondsToHMS,
  secondsToMS,
  millisecondsToHMS,
  sleep
} from '@ooneex/utils';

// Convert seconds to time formats
console.log(secondsToHMS(3661)); // '1:01:01'
console.log(secondsToMS(125)); // '2:05'

// Convert milliseconds to HMS
console.log(millisecondsToHMS(3661000)); // '1:01:01'

// Async sleep utility
await sleep(1000); // Wait for 1 second
```

### Data Conversion

```typescript
import { parseString, dataURLtoFile } from '@ooneex/utils';

// Parse strings to appropriate types
console.log(parseString('123')); // 123 (number)
console.log(parseString('12.5')); // 12.5 (number)
console.log(parseString('true')); // true (boolean)
console.log(parseString('null')); // null
console.log(parseString('[1, 2, 3]')); // [1, 2, 3] (array)
console.log(parseString('{"key": "value"}')); // {key: "value"} (object)

// Convert DataURL to File
const dataURL = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
const file = dataURLtoFile(dataURL, 'hello.txt');
console.log(file.name); // 'hello.txt'
console.log(file.type); // 'text/plain'
```

### Random Generation

```typescript
import { random } from '@ooneex/utils';

// Generate random hex IDs
console.log(random.nanoid()); // 'a1b2c3d4e5' (10 chars by default)
console.log(random.nanoid(8)); // 'a1b2c3d4' (8 chars)

// Generate numeric strings
console.log(random.stringInt()); // '1234567890' (10 digits by default)
console.log(random.stringInt(6)); // '123456' (6 digits)

// Create custom generators
const customId = random.nanoidFactory(12);
console.log(customId()); // 12-character hex string
console.log(customId(8)); // 8-character hex string (overrides factory default)
```

### Number Formatting

```typescript
import { formatRelativeNumber } from '@ooneex/utils';

// Format large numbers
console.log(formatRelativeNumber(1234)); // '1.2K'
console.log(formatRelativeNumber(1234567)); // '1.2M'
console.log(formatRelativeNumber(1234567890)); // '1.2B'

// Custom precision and locale
console.log(formatRelativeNumber(1234.56, { precision: 2 })); // '1.23K'
console.log(formatRelativeNumber(1234, { lang: 'de-DE' })); // '1,2 Tsd.'
```

### Environment Variables

```typescript
import { parseEnvVars } from '@ooneex/utils';

// Parse environment variables with automatic type conversion and key transformation
const envVars = {
  DATABASE_URL: "postgres://localhost:5432/db",
  API_PORT: "3000",
  DEBUG_MODE: "true",
  MAX_CONNECTIONS: "100",
  ALLOWED_ORIGINS: "[localhost, example.com, api.example.com]",
  FEATURE_FLAGS: '{"analytics": true, "logging": false}',
  APP_VERSION: "1.2.3"
};

const config = parseEnvVars(envVars);

console.log(config);
// {
//   databaseUrl: "postgres://localhost:5432/db",     // SCREAMING_SNAKE_CASE → camelCase
//   apiPort: 3000,                                   // string → number
//   debugMode: true,                                 // string → boolean
//   maxConnections: 100,                             // string → number
//   allowedOrigins: ["localhost", "example.com", "api.example.com"],  // array parsing
//   featureFlags: { analytics: true, logging: false }, // JSON parsing
//   appVersion: "1.2.3"                              // stays as string
// }
```

## API Reference

### String Utilities

#### `capitalizeWord(word: string): string`
Capitalizes the first letter of a word and converts the rest to lowercase.

**Example:**
```typescript
capitalizeWord('hello'); // 'Hello'
capitalizeWord('WORLD'); // 'World'
```

#### `toCamelCase(input: string): string`
Converts a string to camelCase.

**Example:**
```typescript
toCamelCase('hello world'); // 'helloWorld'
toCamelCase('hello-world_example'); // 'helloWorldExample'
```

#### `toPascalCase(input: string): string`
Converts a string to PascalCase.

**Example:**
```typescript
toPascalCase('hello world'); // 'HelloWorld'
toPascalCase('hello-world_example'); // 'HelloWorldExample'
```

#### `toKebabCase(input: string): string`
Converts a string to kebab-case.

**Example:**
```typescript
toKebabCase('Hello World'); // 'hello-world'
toKebabCase('helloWorldExample'); // 'hello-world-example'
```

#### `splitToWords(input: string): string[]`
Splits a string into an array of words, handling various separators.

**Example:**
```typescript
splitToWords('hello-world_example'); // ['hello', 'world', 'example']
splitToWords('camelCaseString'); // ['camel', 'Case', 'String']
```

#### `trim(input: string, pattern?: string): string`
Trims whitespace or custom patterns from a string.

**Parameters:**
- `input` - The string to trim
- `pattern` - Optional regex pattern to trim (default: whitespace)

**Example:**
```typescript
trim('  hello  '); // 'hello'
trim('[hello]', '\\[|\\]'); // 'hello'
```

### Time Utilities

#### `secondsToHMS(seconds: number): string`
Converts seconds to HH:MM:SS format.

**Example:**
```typescript
secondsToHMS(3661); // '1:01:01'
secondsToHMS(125); // '0:02:05'
```

#### `secondsToMS(seconds: number): string`
Converts seconds to MM:SS format.

**Example:**
```typescript
secondsToMS(125); // '2:05'
secondsToMS(61); // '1:01'
```

#### `millisecondsToHMS(milliseconds: number): string`
Converts milliseconds to HH:MM:SS format.

**Example:**
```typescript
millisecondsToHMS(3661000); // '1:01:01'
millisecondsToHMS(125000); // '0:02:05'
```

#### `sleep(ms: number): Promise<void>`
Async utility to pause execution for specified milliseconds.

**Example:**
```typescript
await sleep(1000); // Wait for 1 second
await sleep(500);  // Wait for 500 milliseconds
```

### Data Conversion

#### `parseString<T = unknown>(text: string): T`
Intelligently parses a string to its appropriate type.

**Supported conversions:**
- Numbers (integers and floats)
- Booleans (`'true'`/`'false'`)
- `null`
- Arrays (JSON format)
- Objects (JSON format)
- Falls back to original string

**Example:**
```typescript
parseString('123'); // 123
parseString('12.5'); // 12.5
parseString('true'); // true
parseString('[1, 2, 3]'); // [1, 2, 3]
parseString('invalid'); // 'invalid'
```

#### `dataURLtoFile(dataURL: string, filename: string): File`
Converts a Data URL to a File object.

**Parameters:**
- `dataURL` - The Data URL string
- `filename` - The desired filename for the File object

**Example:**
```typescript
const dataURL = 'data:text/plain;base64,SGVsbG8=';
const file = dataURLtoFile(dataURL, 'hello.txt');
```

### Random Generation

#### `random.nanoid(size?: number): string`
Generates a random hexadecimal ID.

**Parameters:**
- `size` - Optional length (default: 10)

**Example:**
```typescript
random.nanoid(); // 'a1b2c3d4e5'
random.nanoid(8); // 'a1b2c3d4'
```

#### `random.stringInt(size?: number): string`
Generates a random numeric string.

**Parameters:**
- `size` - Optional length (default: 10)

**Example:**
```typescript
random.stringInt(); // '1234567890'
random.stringInt(6); // '123456'
```

#### `random.nanoidFactory(size?: number): (size?: number) => string`
Creates a factory function for generating IDs with a default size.

**Parameters:**
- `size` - Default length for generated IDs

**Returns:** Function that generates IDs

**Example:**
```typescript
const generateId = random.nanoidFactory(12);
generateId(); // 12-character ID
generateId(8); // 8-character ID (overrides default)
```

### Number Formatting

#### `formatRelativeNumber(num: number, config?: { precision?: number; lang?: string }): string`
Formats numbers using compact notation (K, M, B, etc.).

**Parameters:**
- `num` - The number to format
- `config.precision` - Decimal places (default: 1)
- `config.lang` - Locale for formatting (default: 'en-GB')

**Example:**
```typescript
formatRelativeNumber(1234); // '1.2K'
formatRelativeNumber(1234567, { precision: 2 }); // '1.23M'
formatRelativeNumber(1234, { lang: 'de-DE' }); // '1,2 Tsd.'
```

### Environment Variables

#### `parseEnvVars<T>(envVars: Record<string, string>): T`
Parses environment variables with automatic key transformation (SCREAMING_SNAKE_CASE to camelCase) and intelligent type conversion.

**Parameters:**
- `envVars` - Object with SCREAMING_SNAKE_CASE keys and string values

**Returns:** Object with camelCase keys and parsed values

**Type conversions:**
- Numbers (integers and floats)
- Booleans (`'true'`/`'false'`, case-insensitive)
- `null` (case-insensitive)
- Arrays (bracket notation: `[item1, item2, item3]`)
- Objects (valid JSON strings)
- Falls back to original string

**Example:**
```typescript
const envVars = {
  API_PORT: "3000",           // → apiPort: 3000
  DEBUG_MODE: "true",         // → debugMode: true
  ALLOWED_IPS: "[127.0.0.1, localhost]",  // → allowedIps: ["127.0.0.1", "localhost"]
  CONFIG_JSON: '{"timeout": 5000}',       // → configJson: {timeout: 5000}
  DATABASE_URL: "postgres://localhost"    // → databaseUrl: "postgres://localhost"
};

const config = parseEnvVars(envVars);
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
