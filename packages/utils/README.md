# @ooneex/utils

A comprehensive collection of utility functions for common programming tasks including string manipulation, number formatting, time conversion, and more.

## Installation

```bash
npm install @ooneex/utils
# or
bun add @ooneex/utils
# or
yarn add @ooneex/utils
# or
pnpm add @ooneex/utils
```

## Usage

```typescript
import { capitalizeWord, formatRelativeNumber, random, sleep, dataURLtoFile } from '@ooneex/utils';
```

## API Reference

### File Utilities

#### `dataURLtoFile(dataurl: string, filename: string): File`

Converts a data URL string into a File object, useful for handling base64-encoded file data.

**Examples:**
```typescript
import { dataURLtoFile } from '@ooneex/utils';

// Convert a data URL to a File object
const dataUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
const file = dataURLtoFile(dataUrl, 'hello.txt');

// Use with image data URLs
const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...';
const imageFile = dataURLtoFile(imageDataUrl, 'image.png');

// The resulting File object can be used in FormData or uploaded
const formData = new FormData();
formData.append('file', file);
```

### String Utilities

#### `capitalizeWord(word: string): string`

Capitalizes the first letter of a word and makes the rest lowercase.

**Examples:**
```typescript
import { capitalizeWord } from '@ooneex/utils';

capitalizeWord('hello');      // 'Hello'
capitalizeWord('WORLD');      // 'World'
capitalizeWord('javaScript'); // 'Javascript'
capitalizeWord('');           // ''
```

#### `splitToWords(input: string): string[]`

Splits a string into an array of words, handling camelCase, PascalCase, kebab-case, snake_case, and more.

**Examples:**
```typescript
import { splitToWords } from '@ooneex/utils';

splitToWords('helloWorld');           // ['hello', 'World']
splitToWords('PascalCaseString');     // ['Pascal', 'Case', 'String']
splitToWords('kebab-case-string');    // ['kebab', 'case', 'string']
splitToWords('snake_case_string');    // ['snake', 'case', 'string']
splitToWords('HTMLElement123');       // ['HTML', 'Element', '123']
splitToWords('URLParser');            // ['URL', 'Parser']
```

#### `toCamelCase(input: string): string`

Converts a string to camelCase.

**Examples:**
```typescript
import { toCamelCase } from '@ooneex/utils';

toCamelCase('hello world');           // 'helloWorld'
toCamelCase('PascalCaseString');      // 'pascalCaseString'
toCamelCase('kebab-case-string');     // 'kebabCaseString'
toCamelCase('snake_case_string');     // 'snakeCaseString'
toCamelCase('  SPACED  STRING  ');    // 'spacedString'
```

#### `toPascalCase(input: string): string`

Converts a string to PascalCase.

**Examples:**
```typescript
import { toPascalCase } from '@ooneex/utils';

toPascalCase('hello world');          // 'HelloWorld'
toPascalCase('camelCaseString');      // 'CamelCaseString'
toPascalCase('kebab-case-string');    // 'KebabCaseString'
toPascalCase('snake_case_string');    // 'SnakeCaseString'
toPascalCase('  spaced  string  ');   // 'SpacedString'
```

#### `toKebabCase(input: string): string`

Converts a string to kebab-case.

**Examples:**
```typescript
import { toKebabCase } from '@ooneex/utils';

toKebabCase('Hello World');           // 'hello-world'
toKebabCase('camelCaseString');       // 'camel-case-string'
toKebabCase('PascalCaseString');      // 'pascal-case-string'
toKebabCase('snake_case_string');     // 'snake-case-string'
toKebabCase('  SPACED  STRING  ');    // 'spaced-string'
```

#### `trim(text: string, char?: string): string`

Trims specified characters from the beginning and end of a string. Defaults to trimming whitespace.

**Examples:**
```typescript
import { trim } from '@ooneex/utils';

trim('  hello world  ');              // 'hello world'
trim('...hello world...', '.');       // 'hello world'
trim('[hello world]', '[');           // 'hello world]'
trim('[hello world]', '\\[|\\]');     // 'hello world'
trim('***hello world***', '*');       // 'hello world'
```

### Parsing Utilities

#### `parseString<T = unknown>(text: string): T`

Intelligently parses a string into appropriate JavaScript types (number, boolean, array, object, etc.).

**Examples:**
```typescript
import { parseString } from '@ooneex/utils';

parseString('123');                   // 123 (number)
parseString('45.67');                 // 45.67 (number)
parseString('true');                  // true (boolean)
parseString('false');                 // false (boolean)
parseString('null');                  // null
parseString('[1, 2, 3]');             // [1, 2, 3] (array)
parseString('{"key": "value"}');      // { key: "value" } (object)
parseString('hello');                 // 'hello' (string)
parseString('[apple, banana, 123]'); // ['apple', 'banana', 123]
```

#### `parseEnvVars<T = Record<string, unknown>>(envs: Record<string, unknown>): T`

Parses environment variables, converting keys to camelCase and values to appropriate types.

**Examples:**
```typescript
import { parseEnvVars } from '@ooneex/utils';

const envVars = {
  'DATABASE_URL': 'postgresql://localhost:5432/db',
  'PORT': '3000',
  'ENABLE_LOGGING': 'true',
  'MAX_CONNECTIONS': '100'
};

const parsed = parseEnvVars(envVars);
// {
//   databaseUrl: 'postgresql://localhost:5432/db',
//   port: 3000,
//   enableLogging: true,
//   maxConnections: 100
// }
```

### Number Formatting

#### `formatRelativeNumber(num: number, config?: { precision?: number; lang?: string }): string`

Formats numbers using compact notation (K, M, B, etc.).

**Examples:**
```typescript
import { formatRelativeNumber } from '@ooneex/utils';

formatRelativeNumber(1234);                           // '1.2K'
formatRelativeNumber(1234567);                        // '1.2M'
formatRelativeNumber(1234567890);                     // '1.2B'
formatRelativeNumber(1234, { precision: 0 });         // '1K'
formatRelativeNumber(1234, { precision: 2 });         // '1.23K'
formatRelativeNumber(1234, { lang: 'de' });           // '1,2 Tsd.'
formatRelativeNumber(1500000, { lang: 'fr' });        // '1,5 M'
```

### Time Conversion

#### `millisecondsToHMS(ms: number): string`

Converts milliseconds to HH:MM:SS or MM:SS format.

**Examples:**
```typescript
import { millisecondsToHMS } from '@ooneex/utils';

millisecondsToHMS(30000);          // '30'
millisecondsToHMS(90000);          // '1:30'
millisecondsToHMS(3661000);        // '1:01:01'
millisecondsToHMS(45000);          // '45'
millisecondsToHMS(125000);         // '2:05'
millisecondsToHMS(7323000);        // '2:02:03'
```

#### `secondsToHMS(seconds: number): string`

Converts seconds to HH:MM:SS or MM:SS format.

**Examples:**
```typescript
import { secondsToHMS } from '@ooneex/utils';

secondsToHMS(30);                  // '30'
secondsToHMS(90);                  // '1:30'
secondsToHMS(3661);                // '1:01:01'
secondsToHMS(45);                  // '45'
secondsToHMS(125);                 // '2:05'
secondsToHMS(7323);                // '2:02:03'
```

#### `secondsToMS(seconds: number): string`

Converts seconds to MM:SS format.

**Examples:**
```typescript
import { secondsToMS } from '@ooneex/utils';

secondsToMS(30);                   // '0:30'
secondsToMS(90);                   // '1:30'
secondsToMS(125);                  // '2:05'
secondsToMS(3661);                 // '61:01'
```

### Random Generation

#### `random`

Object containing various random string generation functions.

**Examples:**
```typescript
import { random } from '@ooneex/utils';

// Generate random hexadecimal string (default 10 characters)
random.nanoid();                   // 'a1b2c3d4e5'
random.nanoid(5);                  // '1a2b3'
random.nanoid(16);                 // '1234567890abcdef'

// Generate random numeric string
random.stringInt();                // '1234567890'
random.stringInt(5);               // '12345'

// Create a factory function for consistent length
const generateId = random.nanoidFactory(8);
generateId();                      // 'a1b2c3d4'
generateId();                      // '5e6f7890'
```

### Async Utilities

#### `sleep(ms: number): Promise<void>`

Creates a promise that resolves after the specified number of milliseconds, useful for adding delays in async functions.

**Examples:**
```typescript
import { sleep } from '@ooneex/utils';

// Wait for 1 second
await sleep(1000);

// Use in async function
async function delayedOperation() {
  console.log('Starting...');
  await sleep(2000);  // Wait 2 seconds
  console.log('Done!');
}

// Use with other async operations
async function retryWithDelay() {
  for (let i = 0; i < 3; i++) {
    try {
      await someOperation();
      break;
    } catch (error) {
      if (i < 2) await sleep(1000); // Wait 1 second before retry
    }
  }
}
```

## Type Safety

All functions are fully typed with TypeScript, providing excellent IDE support and compile-time type checking.

```typescript
// Generic type support
const parsedNumber = parseString<number>('123');     // Type: number
const parsedArray = parseString<string[]>('[a,b,c]'); // Type: string[]

// Environment variables with custom type
interface AppConfig {
  port: number;
  databaseUrl: string;
  enableLogging: boolean;
}

const config = parseEnvVars<AppConfig>(process.env);
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
