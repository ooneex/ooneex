# @ooneex/utils

A comprehensive TypeScript/JavaScript utility library providing essential helper functions for string manipulation, time formatting, data parsing, and more. This package offers a collection of lightweight, type-safe utilities designed to streamline common development tasks across web applications.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **String Manipulation** - Case conversion utilities (camelCase, PascalCase, kebab-case)

✅ **Time Formatting** - Convert seconds/milliseconds to human-readable formats

✅ **Data Parsing** - Intelligent string parsing with type inference

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Lightweight** - Minimal dependencies and optimized bundle size

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Environment Variables** - Parse and transform environment variables

✅ **File Utilities** - Convert data URLs to File objects

✅ **Random Generation** - Generate random IDs and strings

✅ **Number Formatting** - Format numbers with locale-aware compact notation

✅ **Zero Dependencies** - Only one small dependency (nanoid) for random generation

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

### String Manipulation

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

// Split strings to words
console.log(splitToWords('HelloWorldExample')); // ['Hello', 'World', 'Example']
console.log(splitToWords('hello-world_example')); // ['hello', 'world', 'example']

// Advanced trimming
console.log(trim('...hello...', '\\.')); // 'hello'
console.log(trim('[test]', '\\[|\\]')); // 'test'
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
console.log(secondsToHMS(125)); // '2:05'
console.log(secondsToHMS(45)); // '45'

console.log(secondsToMS(125)); // '2:05'
console.log(secondsToMS(45)); // '0:45'

// Convert milliseconds to time format
console.log(millisecondsToHMS(3661000)); // '1:01:01'
console.log(millisecondsToHMS(125000)); // '2:05'

// Async sleep utility
await sleep(1000); // Wait 1 second
```

### Data Parsing

```typescript
import { parseString, parseEnvVars } from '@ooneex/utils';

// Intelligent string parsing with type inference
console.log(parseString('123')); // 123 (number)
console.log(parseString('12.34')); // 12.34 (number)
console.log(parseString('true')); // true (boolean)
console.log(parseString('false')); // false (boolean)
console.log(parseString('null')); // null
console.log(parseString('[1,2,3]')); // [1, 2, 3] (array)
console.log(parseString('{"name":"John"}')); // {name: "John"} (object)
console.log(parseString('1e5')); // 100000 (scientific notation)
console.log(parseString('hello')); // 'hello' (string fallback)

// Parse environment variables
const envs = {
  'API_PORT': '3000',
  'DEBUG_MODE': 'true',
  'ALLOWED_HOSTS': '["localhost", "127.0.0.1"]'
};

const parsed = parseEnvVars(envs);
// Result: { apiPort: 3000, debugMode: true, allowedHosts: ['localhost', '127.0.0.1'] }
```

### Number Formatting

```typescript
import { formatRelativeNumber } from '@ooneex/utils';

// Format numbers with compact notation
console.log(formatRelativeNumber(1000)); // '1K'
console.log(formatRelativeNumber(1500)); // '1.5K'
console.log(formatRelativeNumber(1000000)); // '1M'
console.log(formatRelativeNumber(2500000)); // '2.5M'
console.log(formatRelativeNumber(1000000000)); // '1B'

// Custom precision
console.log(formatRelativeNumber(1234, { precision: 2 })); // '1.23K'
console.log(formatRelativeNumber(1234, { precision: 0 })); // '1K'

// Different locales
console.log(formatRelativeNumber(1500, { lang: 'de-DE' })); // '1500'
console.log(formatRelativeNumber(1500000, { lang: 'de-DE' })); // '1,5 Mio.'
console.log(formatRelativeNumber(1500, { lang: 'fr-FR' })); // '1,5 k'
```

### File Utilities

```typescript
import { dataURLtoFile } from '@ooneex/utils';

// Convert data URL to File object
const dataUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
const file = dataURLtoFile(dataUrl, 'hello.txt');

console.log(file.name); // 'hello.txt'
console.log(file.type); // 'text/plain'
console.log(file.size); // 11
```

### Random Generation

```typescript
import { random } from '@ooneex/utils';

// Generate random hex strings
console.log(random.nanoid()); // 'a1b2c3d4e5' (10 chars default)
console.log(random.nanoid(8)); // 'f6e5d4c3' (8 chars)

// Generate numeric strings
console.log(random.stringInt()); // '1234567890' (10 digits default)
console.log(random.stringInt(6)); // '123456' (6 digits)

// Create a factory function
const generateId = random.nanoidFactory(12);
console.log(generateId()); // 12-character hex string
console.log(generateId(8)); // 8-character hex string (overrides factory size)
```

## API Reference

### String Utilities

#### `capitalizeWord(word: string): string`
Capitalizes the first letter and lowercases the rest.

**Parameters:**
- `word` - The word to capitalize

**Returns:** Capitalized word

**Example:**
```typescript
capitalizeWord('hello'); // 'Hello'
capitalizeWord('WORLD'); // 'World'
capitalizeWord(''); // ''
```

#### `toCamelCase(input: string): string`
Converts string to camelCase.

**Parameters:**
- `input` - The string to convert

**Returns:** camelCase string

**Example:**
```typescript
toCamelCase('hello world'); // 'helloWorld'
toCamelCase('Hello-World_Example'); // 'helloWorldExample'
toCamelCase('API_KEY'); // 'apiKey'
```

#### `toPascalCase(input: string): string`
Converts string to PascalCase.

**Parameters:**
- `input` - The string to convert

**Returns:** PascalCase string

**Example:**
```typescript
toPascalCase('hello world'); // 'HelloWorld'
toPascalCase('api-key'); // 'ApiKey'
toPascalCase('user_name'); // 'UserName'
```

#### `toKebabCase(input: string): string`
Converts string to kebab-case.

**Parameters:**
- `input` - The string to convert

**Returns:** kebab-case string

**Example:**
```typescript
toKebabCase('Hello World'); // 'hello-world'
toKebabCase('camelCaseString'); // 'camel-case-string'
toKebabCase('PascalCaseString'); // 'pascal-case-string'
```

#### `splitToWords(input: string): string[]`
Splits a string into individual words, handling various naming conventions.

**Parameters:**
- `input` - The string to split

**Returns:** Array of words

**Example:**
```typescript
splitToWords('HelloWorld'); // ['Hello', 'World']
splitToWords('hello-world_example'); // ['hello', 'world', 'example']
splitToWords('XMLHttpRequest'); // ['XML', 'Http', 'Request']
splitToWords('user123Name'); // ['user', '123', 'Name']
```

#### `trim(text: string, char?: string): string`
Trims specified characters from the beginning and end of a string.

**Parameters:**
- `text` - The string to trim
- `char` - Characters to trim (default: space). Supports regex patterns.

**Returns:** Trimmed string

**Example:**
```typescript
trim('  hello  '); // 'hello'
trim('...hello...', '\\.'); // 'hello'
trim('[test]', '\\[|\\]'); // 'test'
trim('!!hello!!', '!'); // 'hello'
```

### Time Utilities

#### `secondsToHMS(seconds: number): string`
Converts seconds to HH:MM:SS or MM:SS or SS format.

**Parameters:**
- `seconds` - Number of seconds

**Returns:** Formatted time string

**Example:**
```typescript
secondsToHMS(3661); // '1:01:01' (1 hour, 1 minute, 1 second)
secondsToHMS(125); // '2:05' (2 minutes, 5 seconds)
secondsToHMS(45); // '45' (45 seconds)
secondsToHMS(0); // '0'
```

#### `secondsToMS(seconds: number): string`
Converts seconds to MM:SS format.

**Parameters:**
- `seconds` - Number of seconds

**Returns:** MM:SS formatted string

**Example:**
```typescript
secondsToMS(125); // '2:05'
secondsToMS(45); // '0:45'
secondsToMS(3661); // '61:01'
```

#### `millisecondsToHMS(ms: number): string`
Converts milliseconds to HH:MM:SS or MM:SS or SS format.

**Parameters:**
- `ms` - Number of milliseconds

**Returns:** Formatted time string

**Example:**
```typescript
millisecondsToHMS(3661000); // '1:01:01'
millisecondsToHMS(125000); // '2:05'
millisecondsToHMS(45000); // '45'
millisecondsToHMS(500); // '0'
```

#### `sleep(ms: number): Promise<void>`
Creates a promise that resolves after the specified number of milliseconds.

**Parameters:**
- `ms` - Number of milliseconds to wait

**Returns:** Promise that resolves after the delay

**Example:**
```typescript
await sleep(1000); // Wait 1 second
await sleep(500); // Wait 0.5 seconds

// Usage in async function
async function delayedLog() {
  console.log('First');
  await sleep(2000);
  console.log('Second (2 seconds later)');
}
```

### Data Parsing

#### `parseString<T>(text: string): T`
Intelligently parses a string and returns the appropriate type.

**Parameters:**
- `text` - The string to parse

**Returns:** Parsed value with inferred type

**Supported Formats:**
- Integers: `"123"` → `123`
- Floats: `"12.34"` → `12.34`
- Scientific notation: `"1e5"` → `100000`
- Booleans: `"true"`, `"false"` (case insensitive)
- Null: `"null"` (case insensitive)
- Arrays: `"[1,2,3]"` → `[1, 2, 3]`
- Objects: `'{"key":"value"}'` → `{key: "value"}`
- JSON strings: `'"hello"'` → `"hello"`

**Example:**
```typescript
parseString('123'); // 123 (number)
parseString('12.34'); // 12.34 (number)
parseString('1e3'); // 1000 (number)
parseString('true'); // true (boolean)
parseString('null'); // null
parseString('[1,2,3]'); // [1, 2, 3] (array)
parseString('{"name":"John"}'); // {name: "John"} (object)
parseString('hello'); // 'hello' (string fallback)

// With type annotation
const num = parseString<number>('123'); // TypeScript knows it's a number
const arr = parseString<number[]>('[1,2,3]'); // TypeScript knows it's number[]
```

#### `parseEnvVars<T>(envs: Record<string, string>): T`
Parses environment variables, converting keys to camelCase and values using `parseString`.

**Parameters:**
- `envs` - Object with environment variable key-value pairs

**Returns:** Object with camelCase keys and parsed values

**Example:**
```typescript
const envVars = {
  'API_PORT': '3000',
  'DEBUG_MODE': 'true',
  'ALLOWED_HOSTS': '["localhost", "127.0.0.1"]',
  'MAX_CONNECTIONS': '100',
  'ENABLE_SSL': 'false'
};

const config = parseEnvVars(envVars);
// Result:
// {
//   apiPort: 3000,
//   debugMode: true,
//   allowedHosts: ['localhost', '127.0.0.1'],
//   maxConnections: 100,
//   enableSsl: false
// }

// With type annotation
interface Config {
  apiPort: number;
  debugMode: boolean;
  allowedHosts: string[];
}
const typedConfig = parseEnvVars<Config>(envVars);
```

### Number Utilities

#### `formatRelativeNumber(num: number, config?: { precision?: number; lang?: string }): string`
Formats numbers using compact notation with locale support.

**Parameters:**
- `num` - The number to format
- `config.precision` - Maximum decimal places (default: 1)
- `config.lang` - Locale code (default: 'en-GB')

**Returns:** Formatted number string

**Example:**
```typescript
formatRelativeNumber(1000); // '1K'
formatRelativeNumber(1500); // '1.5K'
formatRelativeNumber(1000000); // '1M'
formatRelativeNumber(1000000000); // '1B'

// Custom precision
formatRelativeNumber(1234, { precision: 2 }); // '1.23K'
formatRelativeNumber(1234, { precision: 0 }); // '1K'

// Different locales
formatRelativeNumber(1500, { lang: 'de-DE' }); // '1500'
formatRelativeNumber(1500000, { lang: 'de-DE' }); // '1,5 Mio.'
formatRelativeNumber(1500, { lang: 'fr-FR' }); // '1,5 k'
formatRelativeNumber(1500, { lang: 'es-ES' }); // '1,5 mil'
```

### File Utilities

#### `dataURLtoFile(dataurl: string, filename: string): File`
Converts a data URL to a File object.

**Parameters:**
- `dataurl` - The data URL string
- `filename` - The desired filename for the File object

**Returns:** File object

**Example:**
```typescript
// Text file
const textDataUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
const textFile = dataURLtoFile(textDataUrl, 'hello.txt');
console.log(textFile.name); // 'hello.txt'
console.log(textFile.type); // 'text/plain'
console.log(textFile.size); // 11

// Image file
const imgDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const imgFile = dataURLtoFile(imgDataUrl, 'pixel.png');
console.log(imgFile.type); // 'image/png'

// Usage with FileReader
const reader = new FileReader();
reader.onload = (e) => console.log(e.target?.result);
reader.readAsText(textFile);
```

### Random Generation

#### `random.nanoid(size?: number): string`
Generates a random hexadecimal string.

**Parameters:**
- `size` - Length of the generated string (default: 10)

**Returns:** Random hex string

**Example:**
```typescript
random.nanoid(); // 'a1b2c3d4e5' (10 characters)
random.nanoid(8); // 'f6e5d4c3' (8 characters)
random.nanoid(16); // '1a2b3c4d5e6f7890' (16 characters)
```

#### `random.stringInt(size?: number): string`
Generates a random numeric string.

**Parameters:**
- `size` - Length of the generated string (default: 10)

**Returns:** Random numeric string

**Example:**
```typescript
random.stringInt(); // '1234567890' (10 digits)
random.stringInt(6); // '123456' (6 digits)
random.stringInt(4); // '9876' (4 digits)
```

#### `random.nanoidFactory(size?: number): (size?: number) => string`
Creates a factory function for generating random hex strings.

**Parameters:**
- `size` - Default length for the factory (default: 10)

**Returns:** Factory function that accepts optional size parameter

**Example:**
```typescript
const generateId = random.nanoidFactory(12);
generateId(); // 12-character hex string
generateId(8); // 8-character hex string (overrides factory default)
generateId(16); // 16-character hex string

const generateShortId = random.nanoidFactory(6);
generateShortId(); // 6-character hex string
```

## Advanced Usage

### Environment Configuration

```typescript
import { parseEnvVars } from '@ooneex/utils';

// Define your configuration interface
interface AppConfig {
  port: number;
  host: string;
  debug: boolean;
  features: string[];
  dbConfig: {
    host: string;
    port: number;
  };
}

// Parse environment variables
const envConfig = parseEnvVars<Partial<AppConfig>>(process.env);

// Merge with defaults
const config: AppConfig = {
  port: 3000,
  host: 'localhost',
  debug: false,
  features: [],
  dbConfig: { host: 'localhost', port: 5432 },
  ...envConfig
};
```

### String Processing Pipeline

```typescript
import { splitToWords, toCamelCase, capitalizeWord } from '@ooneex/utils';

function processUserInput(input: string): {
  words: string[];
  camelCase: string;
  title: string;
  kebabCase: string;
} {
  const words = splitToWords(input);

  return {
    words,
    camelCase: toCamelCase(input),
    title: words.map(capitalizeWord).join(' '),
    kebabCase: toKebabCase(input)
  };
}

const result = processUserInput('user-profile_settings');
// {
//   words: ['user', 'profile', 'settings'],
//   camelCase: 'userProfileSettings',
//   title: 'User Profile Settings',
//   kebabCase: 'user-profile-settings'
// }
```

### Time-based Progress Tracking

```typescript
import { millisecondsToHMS, formatRelativeNumber } from '@ooneex/utils';

class ProgressTracker {
  private startTime: number;
  private itemsProcessed: number = 0;
  private totalItems: number;

  constructor(totalItems: number) {
    this.startTime = Date.now();
    this.totalItems = totalItems;
  }

  update(processed: number): string {
    this.itemsProcessed = processed;
    const elapsed = Date.now() - this.startTime;
    const rate = processed / (elapsed / 1000);
    const remaining = (this.totalItems - processed) / rate * 1000;

    return [
      `Processed: ${formatRelativeNumber(processed)}/${formatRelativeNumber(this.totalItems)}`,
      `Elapsed: ${millisecondsToHMS(elapsed)}`,
      `ETA: ${millisecondsToHMS(remaining)}`
    ].join(' | ');
  }
}

const tracker = new ProgressTracker(100000);
console.log(tracker.update(15000));
// "Processed: 15K/100K | Elapsed: 2:30 | ETA: 14:10"
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
