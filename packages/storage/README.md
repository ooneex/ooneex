# @ooneex/storage

A comprehensive TypeScript/JavaScript storage library providing unified interfaces for file storage operations. This package supports both local filesystem and Cloudflare R2 storage with a consistent API, making it easy to switch between storage backends or use multiple storage providers in your applications.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Unified Storage Interface** - Single API for multiple storage providers

✅ **Local Filesystem Storage** - Fast local file operations with automatic directory management

✅ **Cloudflare R2 Support** - Full integration with Cloudflare's S3-compatible object storage

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Bucket Management** - Create, clear, and manage storage buckets/directories

✅ **Multiple Data Formats** - Support for strings, JSON, ArrayBuffers, Blobs, and streams

✅ **File Operations** - Put, get, delete, exists, and list operations

✅ **Stream Support** - Efficient streaming for large files

✅ **Exception Handling** - Comprehensive error handling with custom exceptions

✅ **Environment Configuration** - Support for environment variables and constructor options

✅ **Zero External Dependencies** - Uses only Bun's built-in APIs

## Installation

### Bun
```bash
bun add @ooneex/storage
```

### pnpm
```bash
pnpm add @ooneex/storage
```

### Yarn
```bash
yarn add @ooneex/storage
```

### npm
```bash
npm install @ooneex/storage
```

## Usage

### Filesystem Storage

#### Basic Setup

```typescript
import { FilesystemStorage } from '@ooneex/storage';

// Using constructor options
const storage = new FilesystemStorage({
  storagePath: './my-storage'
});

// Or using environment variable FILESYSTEM_STORAGE_PATH
const storage = new FilesystemStorage();

// Set bucket/directory
storage.setBucket('my-bucket');
```

#### File Operations

```typescript
import { FilesystemStorage } from '@ooneex/storage';

const storage = new FilesystemStorage({ storagePath: './storage' })
  .setBucket('documents');

// Store string content
await storage.put('hello.txt', 'Hello, World!');

// Store JSON data
await storage.put('config.json', JSON.stringify({ theme: 'dark', version: '1.0' }));

// Store from local file
await storage.putFile('backup.zip', '/path/to/local/file.zip');

// Check if file exists
const exists = await storage.exists('hello.txt'); // true

// Retrieve as string
const content = await storage.getAsArrayBuffer('hello.txt');
const text = new TextDecoder().decode(content);

// Retrieve as JSON
const config = await storage.getAsJson<{ theme: string; version: string }>('config.json');

// Get as stream for large files
const stream = storage.getAsStream('backup.zip');

// List all files
const files = await storage.list(); // ['hello.txt', 'config.json', 'backup.zip']

// Delete file
await storage.delete('hello.txt');

// Clear entire bucket
await storage.clearBucket();
```

### Cloudflare R2 Storage

#### Basic Setup

```typescript
import { CloudflareStorageAdapter } from '@ooneex/storage';

// Using constructor options
const storage = new CloudflareStorageAdapter({
  accessKey: 'your-access-key',
  secretKey: 'your-secret-key',
  endpoint: 'https://your-account.r2.cloudflarestorage.com',
  region: 'EEUR' // EEUR, WEUR, APAC, NAM
});

// Or using environment variables:
// STORAGE_CLOUDFLARE_ACCESS_KEY, STORAGE_CLOUDFLARE_SECRET_KEY, STORAGE_CLOUDFLARE_ENDPOINT, STORAGE_CLOUDFLARE_REGION
const storage = new CloudflareStorageAdapter();

storage.setBucket('my-bucket');
```

#### Advanced Usage

```typescript
import { CloudflareStorageAdapter } from '@ooneex/storage';

const storage = new CloudflareStorageAdapter({
  accessKey: process.env.STORAGE_CLOUDFLARE_ACCESS_KEY!,
  secretKey: process.env.STORAGE_CLOUDFLARE_SECRET_KEY!,
  endpoint: process.env.STORAGE_CLOUDFLARE_ENDPOINT!,
  region: 'EEUR'
}).setBucket('media-files');

// Store different types of content
await storage.put('image.png', new Blob([imageData], { type: 'image/png' }));
await storage.put('data.json', JSON.stringify({ users: [], posts: [] }));
await storage.put('binary-data', new ArrayBuffer(1024));

// Stream large files
const largeFileStream = storage.getAsStream('large-video.mp4');
const response = new Response(largeFileStream);
```

### Working with Different Data Types

```typescript
import { FilesystemStorage } from '@ooneex/storage';

const storage = new FilesystemStorage({ storagePath: './data' })
  .setBucket('examples');

// String content
await storage.put('text.txt', 'Plain text content');

// JSON objects
const userData = { name: 'John', age: 30, active: true };
await storage.put('user.json', JSON.stringify(userData));

// Binary data (ArrayBuffer)
const binaryData = new ArrayBuffer(256);
await storage.put('binary.dat', binaryData);

// Blobs
const blob = new Blob(['CSV data,here'], { type: 'text/csv' });
await storage.put('data.csv', blob);

// Files from disk
await storage.putFile('document.pdf', './local/document.pdf');

// Retrieve data in different formats
const textBuffer = await storage.getAsArrayBuffer('text.txt');
const text = new TextDecoder().decode(textBuffer);

const user = await storage.getAsJson<{ name: string; age: number; active: boolean }>('user.json');

const csvStream = storage.getAsStream('data.csv');
```

### Error Handling

```typescript
import { FilesystemStorage, StorageException } from '@ooneex/storage';

const storage = new FilesystemStorage({ storagePath: './storage' });

try {
  await storage.getAsJson('nonexistent.json');
} catch (error) {
  if (error instanceof StorageException) {
    console.error('Storage error:', error.message);
    console.error('Status:', error.getStatus()); // HTTP status code
  }
}
```

### Using Abstract Interface

```typescript
import { IStorage, FilesystemStorage, CloudflareStorageAdapter } from '@ooneex/storage';

function createStorage(type: 'filesystem' | 'cloudflare'): IStorage {
  switch (type) {
    case 'filesystem':
      return new FilesystemStorage({ storagePath: './storage' });
    case 'cloudflare':
      return new CloudflareStorageAdapter();
    default:
      throw new Error('Unknown storage type');
  }
}

// Use the same interface regardless of storage type
const storage = createStorage('filesystem');
await storage.setBucket('shared-bucket');
await storage.put('shared-file.txt', 'This works with any storage provider');
```

## API Reference

### `IStorage` Interface

The main interface that all storage adapters implement.

```typescript
interface IStorage {
  setBucket(name: string): this;
  list(): Promise<string[]>;
  clearBucket(): Promise<this>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  putFile(key: string, localPath: string): Promise<number>;
  put(key: string, content: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer | Request | Response | BunFile | S3File | Blob): Promise<number>;
  getAsJson<T = unknown>(key: string): Promise<T>;
  getAsArrayBuffer(key: string): Promise<ArrayBuffer>;
  getAsStream(key: string): ReadableStream;
}
```

### `FilesystemStorage` Class

Local filesystem storage implementation.

#### Constructor

```typescript
constructor(options?: {
  storagePath?: string;
})
```

**Parameters:**
- `options.storagePath` - Base path for storage (optional, can use `FILESYSTEM_STORAGE_PATH` env var)

**Example:**
```typescript
const storage = new FilesystemStorage({
  storagePath: '/var/app/storage'
});
```

#### Methods

##### `setBucket(name: string): this`
Sets the bucket (directory) name for operations.

**Parameters:**
- `name` - Bucket/directory name

**Returns:** `this` for method chaining

**Example:**
```typescript
storage.setBucket('uploads');
```

##### `put(key: string, content: ContentType): Promise<number>`
Stores content at the specified key.

**Parameters:**
- `key` - File key/path within the bucket
- `content` - Content to store (string, ArrayBuffer, Blob, etc.)

**Returns:** Number of bytes written

**Example:**
```typescript
const bytesWritten = await storage.put('file.txt', 'Hello World');
```

##### `putFile(key: string, localPath: string): Promise<number>`
Stores a local file at the specified key.

**Parameters:**
- `key` - Destination key/path within the bucket
- `localPath` - Local file system path

**Returns:** Number of bytes written

**Example:**
```typescript
await storage.putFile('backup.zip', './local-backup.zip');
```

##### `get*` Methods

```typescript
// Get as JSON with type safety
getAsJson<T = unknown>(key: string): Promise<T>

// Get as ArrayBuffer
getAsArrayBuffer(key: string): Promise<ArrayBuffer>

// Get as ReadableStream
getAsStream(key: string): ReadableStream
```

##### `exists(key: string): Promise<boolean>`
Checks if a file exists at the specified key.

**Example:**
```typescript
const fileExists = await storage.exists('important.txt');
```

##### `delete(key: string): Promise<void>`
Deletes the file at the specified key.

**Example:**
```typescript
await storage.delete('old-file.txt');
```

##### `list(): Promise<string[]>`
Lists all files in the current bucket.

**Returns:** Array of file keys

**Example:**
```typescript
const files = await storage.list();
console.log('Files:', files); // ['file1.txt', 'folder/file2.json']
```

##### `clearBucket(): Promise<this>`
Removes all files from the current bucket.

**Returns:** `this` for method chaining

**Example:**
```typescript
await storage.clearBucket();
```

### `CloudflareStorageAdapter` Class

Cloudflare R2 storage implementation.

#### Constructor

```typescript
constructor(options?: {
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
  region?: "EEUR" | "WEUR" | "APAC" | "NAM";
})
```

**Parameters:**
- `options.accessKey` - Cloudflare R2 access key (or use `STORAGE_CLOUDFLARE_ACCESS_KEY` env var)
- `options.secretKey` - Cloudflare R2 secret key (or use `STORAGE_CLOUDFLARE_SECRET_KEY` env var)
- `options.endpoint` - Cloudflare R2 endpoint URL (or use `STORAGE_CLOUDFLARE_ENDPOINT` env var)
- `options.region` - Cloudflare R2 region (or use `STORAGE_CLOUDFLARE_REGION` env var)

**Example:**
```typescript
const storage = new CloudflareStorageAdapter({
  accessKey: 'your-access-key',
  secretKey: 'your-secret-key',
  endpoint: 'https://account-id.r2.cloudflarestorage.com',
  region: 'EEUR'
});
```

The `CloudflareStorageAdapter` inherits all methods from `AbstractStorage` and implements the same interface as `FilesystemStorage`.

### `StorageException` Class

Custom exception class for storage-related errors.

```typescript
class StorageException extends Exception {
  constructor(message: string, data?: T)
}
```

**Example:**
```typescript
try {
  await storage.getAsJson('missing.json');
} catch (error) {
  if (error instanceof StorageException) {
    console.error('Storage operation failed:', error.message);
  }
}
```

### `AbstractStorage` Class

Base class providing common functionality for storage adapters.

```typescript
abstract class AbstractStorage implements IStorage {
  protected abstract bucket: string;
  public abstract getOptions(): S3Options;

  // All IStorage methods implemented
}
```

## Environment Variables

### Filesystem Storage

- `FILESYSTEM_STORAGE_PATH` - Base path for filesystem storage

### Cloudflare R2 Storage

- `STORAGE_CLOUDFLARE_ACCESS_KEY` - R2 access key
- `STORAGE_CLOUDFLARE_SECRET_KEY` - R2 secret key
- `STORAGE_CLOUDFLARE_ENDPOINT` - R2 endpoint URL
- `STORAGE_CLOUDFLARE_REGION` - R2 region (EEUR, WEUR, APAC, NAM)

## Error Handling

The library uses custom `StorageException` for all storage-related errors:

```typescript
import { StorageException } from '@ooneex/storage';

try {
  const storage = new FilesystemStorage(); // No path provided
} catch (error) {
  if (error instanceof StorageException) {
    // Handle storage-specific errors
    console.error('Storage setup failed:', error.message);
  }
}
```

Common error scenarios:
- Missing configuration (paths, credentials)
- File not found operations
- Permission errors
- Network errors (for cloud storage)
- Invalid JSON parsing

## Best Practices

### 1. Use Environment Variables for Configuration

```typescript
// .env file
FILESYSTEM_STORAGE_PATH=./storage
STORAGE_CLOUDFLARE_ACCESS_KEY=your-access-key
STORAGE_CLOUDFLARE_SECRET_KEY=your-secret-key
STORAGE_CLOUDFLARE_ENDPOINT=https://your-account.r2.cloudflarestorage.com
STORAGE_CLOUDFLARE_REGION=EEUR

// Application code
const storage = new FilesystemStorage(); // Uses env vars
```

### 2. Implement Proper Error Handling

```typescript
async function safeStorageOperation() {
  try {
    const result = await storage.getAsJson('config.json');
    return result;
  } catch (error) {
    if (error instanceof StorageException) {
      // Log error and provide fallback
      console.warn('Failed to load config:', error.message);
      return getDefaultConfig();
    }
    throw error; // Re-throw unexpected errors
  }
}
```

### 3. Use Streams for Large Files

```typescript
// Good for large files
const stream = storage.getAsStream('large-video.mp4');
const response = new Response(stream, {
  headers: { 'Content-Type': 'video/mp4' }
});

// Avoid for large files - loads entire file into memory
const buffer = await storage.getAsArrayBuffer('large-video.mp4');
```

### 4. Organize Files with Proper Keys

```typescript
// Good - organized structure
await storage.put('users/profile/123.json', userData);
await storage.put('uploads/images/2024/01/photo.jpg', imageData);
await storage.put('logs/2024-01-15.log', logData);

// Less organized
await storage.put('user123.json', userData);
await storage.put('photo.jpg', imageData);
await storage.put('log.txt', logData);
```

### 5. Use Type Safety with JSON Operations

```typescript
interface UserProfile {
  id: number;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Type-safe JSON operations
const profile = await storage.getAsJson<UserProfile>('user/profile.json');
console.log(profile.preferences.theme); // TypeScript knows this exists
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
- Add TypeScript type definitions for new APIs

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run specific test file
bun test tests/FilesystemStorage.spec.ts
```

---

Made with ❤️ by the Ooneex team
