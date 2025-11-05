# @ooneex/fetcher

A powerful and flexible TypeScript/JavaScript HTTP client library built on top of the native Fetch API. This package provides a comprehensive set of methods for making HTTP requests with automatic JSON handling, header management, file uploads, and response status detection.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Native Fetch Based** - Built on top of the modern Fetch API

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **HTTP Methods** - Support for GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS

✅ **File Upload** - Built-in file and blob upload functionality

✅ **Header Management** - Comprehensive header manipulation methods

✅ **Authentication** - Bearer token and basic authentication support

✅ **Request Aborting** - Built-in AbortController support

✅ **Status Detection** - Automatic HTTP status code classification

✅ **JSON Handling** - Automatic JSON serialization and deserialization

✅ **Error Handling** - Comprehensive error handling and response parsing

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Zero Dependencies** - Minimal external dependencies

## Installation

### Bun
```bash
bun add @ooneex/fetcher
```

### pnpm
```bash
pnpm add @ooneex/fetcher
```

### Yarn
```bash
yarn add @ooneex/fetcher
```

### npm
```bash
npm install @ooneex/fetcher
```

## Usage

### Basic Usage

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

// GET request
const response = await api.get('/users');
console.log(response.data); // parsed JSON data
console.log(response.isSuccessful); // true for 2xx status codes

// POST request with JSON data
const newUser = { name: 'John Doe', email: 'john@example.com' };
const createResponse = await api.post('/users', newUser);
```

### Authentication

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

// Bearer token authentication
api.setBearerToken('your-jwt-token');

// Basic authentication
api.setBasicToken('base64-encoded-credentials');

// Make authenticated requests
const response = await api.get('/protected-resource');

// Clear authentication
api.clearBearerToken();
api.clearBasicToken();
```

### Header Management

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

// Set content type
api.setContentType('application/json');

// Set language
api.setLang('en-US');

// Chain header methods
api.setBearerToken('token')
   .setContentType('application/json')
   .setLang('fr-FR');

// Access header object directly
api.header.set('X-Custom-Header', 'custom-value');
```

### File Upload

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

// Upload a file
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const uploadResponse = await api.upload('/upload', file, 'document');

// Upload a blob
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
const blobResponse = await api.upload('/upload-text', blob, 'textFile');
```

### Request Aborting

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

// Start a request
const requestPromise = api.get('/slow-endpoint');

// Abort the request
api.abort();

try {
  const response = await requestPromise;
} catch (error) {
  console.log('Request was aborted');
}
```

### Advanced Usage

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

// Configure headers and authentication
api.setBearerToken('jwt-token')
   .setContentType('application/json')
   .setLang('en-US');

// Make various HTTP requests
const users = await api.get('/users');
const user = await api.post('/users', { name: 'Jane Doe' });
const updated = await api.put('/users/1', { name: 'Jane Smith' });
const patched = await api.patch('/users/1', { email: 'jane@example.com' });
await api.delete('/users/1');

// Check response status
if (user.isSuccessful) {
  console.log('User created:', user.data);
} else if (user.isClientError) {
  console.log('Client error:', user.message);
} else if (user.isServerError) {
  console.log('Server error:', user.message);
}

// Clone fetcher for different configurations
const authenticatedApi = api.clone().setBearerToken('different-token');
```

## API Reference

### `Fetcher` Class

The main class for making HTTP requests.

#### Constructor

##### `new Fetcher(baseURL: string)`
Creates a new Fetcher instance with the specified base URL.

**Parameters:**
- `baseURL` - The base URL for all requests

**Example:**
```typescript
const api = new Fetcher('https://api.example.com');
```

#### Authentication Methods

##### `setBearerToken(token: string): Fetcher`
Sets the Authorization header with a Bearer token.

**Parameters:**
- `token` - The Bearer token

**Returns:** The Fetcher instance for method chaining

**Example:**
```typescript
api.setBearerToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
```

##### `setBasicToken(token: string): Fetcher`
Sets the Authorization header with Basic authentication.

**Parameters:**
- `token` - The base64-encoded credentials

**Returns:** The Fetcher instance for method chaining

**Example:**
```typescript
api.setBasicToken(btoa('username:password'));
```

##### `clearBearerToken(): Fetcher`
Removes the Authorization header.

**Returns:** The Fetcher instance for method chaining

##### `clearBasicToken(): Fetcher`
Removes the Authorization header.

**Returns:** The Fetcher instance for method chaining

#### Header Management Methods

##### `setContentType(contentType: MimeType): Fetcher`
Sets the Content-Type header.

**Parameters:**
- `contentType` - The MIME type for the content

**Returns:** The Fetcher instance for method chaining

**Example:**
```typescript
api.setContentType('application/json');
api.setContentType('multipart/form-data');
```

##### `setLang(lang: string): Fetcher`
Sets the Accept-Language header.

**Parameters:**
- `lang` - The language code

**Returns:** The Fetcher instance for method chaining

**Example:**
```typescript
api.setLang('en-US');
api.setLang('fr-FR');
```

#### Request Control Methods

##### `abort(): Fetcher`
Aborts the current request and creates a new AbortController.

**Returns:** The Fetcher instance for method chaining

**Example:**
```typescript
api.abort(); // Cancels any ongoing requests
```

##### `clone(): Fetcher`
Creates a new Fetcher instance with the same base URL.

**Returns:** A new Fetcher instance

**Example:**
```typescript
const newApi = api.clone();
```

#### HTTP Method Shortcuts

##### `get<T = unknown>(path: string): Promise<FetcherResponseType<T>>`
Performs a GET request.

**Parameters:**
- `path` - The endpoint path

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const users = await api.get<User[]>('/users');
```

##### `post<T = unknown>(path: string, data?: unknown): Promise<FetcherResponseType<T>>`
Performs a POST request.

**Parameters:**
- `path` - The endpoint path
- `data` - Optional request body data

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const newUser = await api.post<User>('/users', { name: 'John' });
```

##### `put<T = unknown>(path: string, data?: unknown): Promise<FetcherResponseType<T>>`
Performs a PUT request.

**Parameters:**
- `path` - The endpoint path
- `data` - Optional request body data

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const updatedUser = await api.put<User>('/users/1', { name: 'Jane' });
```

##### `patch<T = unknown>(path: string, data?: unknown): Promise<FetcherResponseType<T>>`
Performs a PATCH request.

**Parameters:**
- `path` - The endpoint path
- `data` - Optional request body data

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const patchedUser = await api.patch<User>('/users/1', { email: 'new@email.com' });
```

##### `delete<T = unknown>(path: string): Promise<FetcherResponseType<T>>`
Performs a DELETE request.

**Parameters:**
- `path` - The endpoint path

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
await api.delete('/users/1');
```

##### `head<T = unknown>(path: string): Promise<FetcherResponseType<T>>`
Performs a HEAD request.

**Parameters:**
- `path` - The endpoint path

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const headers = await api.head('/users/1');
```

##### `options<T = unknown>(path: string): Promise<FetcherResponseType<T>>`
Performs an OPTIONS request.

**Parameters:**
- `path` - The endpoint path

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const options = await api.options('/users');
```

##### `request<T = unknown>(method: HttpMethodType, path: string, data?: unknown): Promise<FetcherResponseType<T>>`
Performs a custom HTTP request.

**Parameters:**
- `method` - The HTTP method
- `path` - The endpoint path
- `data` - Optional request body data

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const response = await api.request('PATCH', '/users/1', { status: 'active' });
```

##### `upload<T = unknown>(path: string, file: File | Blob, name?: string): Promise<FetcherResponseType<T>>`
Uploads a file or blob.

**Parameters:**
- `path` - The endpoint path
- `file` - The file or blob to upload
- `name` - Optional field name (defaults to "file")

**Returns:** Promise resolving to a FetcherResponseType

**Example:**
```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const response = await api.upload('/upload', file, 'document');
```

#### Properties

##### `header: Header`
Read-only access to the Header instance for direct header manipulation.

**Example:**
```typescript
api.header.set('X-API-Key', 'your-api-key');
const contentType = api.header.get('Content-Type');
```

### Types

#### `FetcherResponseType<T>`
The response object returned by all HTTP methods.

**Properties:**
- `data: T | null` - The parsed response data
- `message: string | null` - Error message if parsing failed
- `header: ReadonlyHeader` - Response headers
- `isInformational: boolean` - True for 1xx status codes
- `isSuccessful: boolean` - True for 2xx status codes
- `isRedirect: boolean` - True for 3xx status codes
- `isClientError: boolean` - True for 4xx status codes
- `isServerError: boolean` - True for 5xx status codes
- `isError: boolean` - True for 4xx or 5xx status codes

**Example:**
```typescript
const response = await api.get<User[]>('/users');

if (response.isSuccessful) {
  console.log('Users:', response.data);
} else if (response.isClientError) {
  console.error('Client error:', response.message);
} else if (response.isServerError) {
  console.error('Server error:', response.message);
}
```

#### `IFetcher`
Interface defining the Fetcher contract.

**Example:**
```typescript
import { IFetcher } from '@ooneex/fetcher';

class CustomFetcher implements IFetcher {
  // Implement all required methods
}
```

## Error Handling

The fetcher automatically handles various error scenarios:

```typescript
import { Fetcher } from '@ooneex/fetcher';

const api = new Fetcher('https://api.example.com');

try {
  const response = await api.get('/users');

  if (response.isSuccessful) {
    // Handle successful response
    console.log('Data:', response.data);
  } else if (response.isClientError) {
    // Handle 4xx errors
    console.error('Client error:', response.message);
  } else if (response.isServerError) {
    // Handle 5xx errors
    console.error('Server error:', response.message);
  }
} catch (error) {
  // Handle network errors or other exceptions
  console.error('Request failed:', error);
}
```

## Advanced Features

### URL Building
The fetcher automatically handles URL building:

```typescript
const api = new Fetcher('https://api.example.com');

// These all work correctly
await api.get('/users');           // -> https://api.example.com/users
await api.get('users');            // -> https://api.example.com/users
await api.get('https://other.com/api'); // -> https://other.com/api (absolute URL)

// Base URL with trailing slash
const api2 = new Fetcher('https://api.example.com/');
await api2.get('/users');          // -> https://api.example.com/users
```

### Content Type Handling
The fetcher automatically sets appropriate Content-Type headers:

```typescript
const api = new Fetcher('https://api.example.com');

// Automatic JSON content type for objects
await api.post('/users', { name: 'John' }); // Content-Type: application/json

// FormData handling
const formData = new FormData();
formData.append('name', 'John');
await api.post('/users', formData); // Content-Type: multipart/form-data

// String data
await api.post('/users', 'raw string data');

// Blob/ArrayBuffer data
const blob = new Blob(['data'], { type: 'text/plain' });
await api.post('/upload', blob);
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

---

Made with ❤️ by the Ooneex team
