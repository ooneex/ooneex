# @ooneex/http-status

A comprehensive TypeScript/JavaScript library for working with HTTP status codes. This package provides all standard HTTP status codes with their corresponding text messages and utility methods to categorize and work with different status code types.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Complete Status Code Collection** - All standard HTTP status codes from 1xx to 5xx

✅ **Status Text Mapping** - Corresponding text messages for all status codes

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Category Detection** - Methods to identify status code categories (informational, success, redirect, error)

✅ **Lightweight** - No external dependencies required

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Standards Compliant** - Based on official HTTP status code specifications

✅ **Easy Integration** - Simple API for common HTTP status operations

## Installation

### Bun
```bash
bun add @ooneex/http-status
```

### pnpm
```bash
pnpm add @ooneex/http-status
```

### Yarn
```bash
yarn add @ooneex/http-status
```

### npm
```bash
npm install @ooneex/http-status
```

## Usage

### Basic Usage

```typescript
import { Status } from '@ooneex/http-status';

const status = new Status();

// Access status codes
console.log(Status.Code.OK); // 200
console.log(Status.Code.NotFound); // 404
console.log(Status.Code.InternalServerError); // 500

// Access status text
console.log(Status.Text[200]); // "OK"
console.log(Status.Text[404]); // "Not Found"
console.log(Status.Text[500]); // "Internal Server Error"

// Or use the exported constants directly
console.log(Status.Code.OK); // 200
console.log(Status.Text[Status.Code.NotFound]); // "Not Found"
```

### Status Code Category Detection

```typescript
import { Status } from '@ooneex/http-status';

const status = new Status();

// Check if status code is successful (2xx)
console.log(status.isSuccessful(Status.Code.OK)); // true
console.log(status.isSuccessful(Status.Code.Created)); // true
console.log(status.isSuccessful(Status.Code.NotFound)); // false

// Check if status code is an error (4xx or 5xx)
console.log(status.isError(Status.Code.BadRequest)); // true
console.log(status.isError(Status.Code.InternalServerError)); // true
console.log(status.isError(Status.Code.OK)); // false

// Check specific error types
console.log(status.isClientError(Status.Code.BadRequest)); // true
console.log(status.isClientError(Status.Code.NotFound)); // true
console.log(status.isServerError(Status.Code.InternalServerError)); // true
console.log(status.isServerError(Status.Code.BadGateway)); // true

// Check for redirects (3xx)
console.log(status.isRedirect(Status.Code.MovedPermanently)); // true
console.log(status.isRedirect(Status.Code.Found)); // true

// Check for informational responses (1xx)
console.log(status.isInformational(Status.Code.Continue)); // true
console.log(status.isInformational(Status.Code.SwitchingProtocols)); // true
```

### Express.js Integration Example

```typescript
import express from 'express';
import { Status } from '@ooneex/http-status';

const app = express();
const status = new Status();

app.get('/api/users/:id', (req, res) => {
  const user = getUserById(req.params.id);

  if (!user) {
    return res.status(Status.Code.NotFound).json({
      error: Status.Text[Status.Code.NotFound],
      message: 'User not found'
    });
  }

  res.status(Status.Code.OK).json(user);
});

app.use((error, req, res, next) => {
  const statusCode = Status.Code.InternalServerError;

  console.log(`Error ${statusCode}: ${Status.Text[statusCode]}`);
  console.log(`Is Server Error: ${status.isServerError(statusCode)}`);

  res.status(statusCode).json({
    error: Status.Text[statusCode]
  });
});
```

### Fetch API Integration Example

```typescript
import { Status } from '@ooneex/http-status';

const status = new Status();

async function apiCall(url: string) {
  try {
    const response = await fetch(url);

    console.log(`Response status: ${response.status} - ${Status.Text[response.status]}`);

    if (status.isSuccessful(response.status)) {
      return await response.json();
    }

    if (status.isClientError(response.status)) {
      throw new Error(`Client error: ${Status.Text[response.status]}`);
    }

    if (status.isServerError(response.status)) {
      throw new Error(`Server error: ${Status.Text[response.status]}`);
    }

    if (status.isRedirect(response.status)) {
      console.log('Redirect response received');
      // Handle redirect logic
    }

  } catch (error) {
    console.error('API call failed:', error);
  }
}
```

## API Reference

### `Status` Class

The main class providing HTTP status code utility methods.

#### Static Properties

##### `Status.Code`
Object containing all HTTP status codes as constants.

**Example:**
```typescript
Status.Code.OK; // 200
Status.Code.NotFound; // 404
Status.Code.InternalServerError; // 500
```

##### `Status.Text`
Object mapping status codes to their text descriptions.

**Example:**
```typescript
Status.Text[200]; // "OK"
Status.Text[404]; // "Not Found"
Status.Text[500]; // "Internal Server Error"
```

#### Methods

##### `isInformational(code: StatusCodeType): boolean`
Checks if a status code is informational (1xx).

**Parameters:**
- `code` - The HTTP status code to check

**Returns:** `true` if the status code is in the 1xx range

**Example:**
```typescript
status.isInformational(100); // true (Continue)
status.isInformational(101); // true (Switching Protocols)
status.isInformational(200); // false (OK)
```

##### `isSuccessful(code: StatusCodeType): boolean`
Checks if a status code indicates success (2xx).

**Example:**
```typescript
status.isSuccessful(200); // true (OK)
status.isSuccessful(201); // true (Created)
status.isSuccessful(204); // true (No Content)
status.isSuccessful(404); // false (Not Found)
```

##### `isRedirect(code: StatusCodeType): boolean`
Checks if a status code indicates a redirect (3xx).

**Example:**
```typescript
status.isRedirect(301); // true (Moved Permanently)
status.isRedirect(302); // true (Found)
status.isRedirect(304); // true (Not Modified)
status.isRedirect(200); // false (OK)
```

##### `isClientError(code: StatusCodeType): boolean`
Checks if a status code indicates a client error (4xx).

**Example:**
```typescript
status.isClientError(400); // true (Bad Request)
status.isClientError(404); // true (Not Found)
status.isClientError(403); // true (Forbidden)
status.isClientError(500); // false (Internal Server Error)
```

##### `isServerError(code: StatusCodeType): boolean`
Checks if a status code indicates a server error (5xx).

**Example:**
```typescript
status.isServerError(500); // true (Internal Server Error)
status.isServerError(502); // true (Bad Gateway)
status.isServerError(503); // true (Service Unavailable)
status.isServerError(404); // false (Not Found)
```

##### `isError(code: StatusCodeType): boolean`
Checks if a status code indicates any error (4xx or 5xx).

**Example:**
```typescript
status.isError(400); // true (Bad Request - client error)
status.isError(500); // true (Internal Server Error - server error)
status.isError(200); // false (OK - success)
status.isError(301); // false (Moved Permanently - redirect)
```

### Constants

#### `Status.Code`
Object containing all HTTP status codes as named constants.

**Available Status Codes:**

**1xx Informational:**
- `Continue` (100)
- `SwitchingProtocols` (101)
- `Processing` (102)
- `EarlyHints` (103)

**2xx Success:**
- `OK` (200)
- `Created` (201)
- `Accepted` (202)
- `NonAuthoritativeInfo` (203)
- `NoContent` (204)
- `ResetContent` (205)
- `PartialContent` (206)
- `MultiStatus` (207)
- `AlreadyReported` (208)
- `IMUsed` (226)

**3xx Redirection:**
- `MultipleChoices` (300)
- `MovedPermanently` (301)
- `Found` (302)
- `SeeOther` (303)
- `NotModified` (304)
- `UseProxy` (305)
- `TemporaryRedirect` (307)
- `PermanentRedirect` (308)

**4xx Client Error:**
- `BadRequest` (400)
- `Unauthorized` (401)
- `PaymentRequired` (402)
- `Forbidden` (403)
- `NotFound` (404)
- `MethodNotAllowed` (405)
- `NotAcceptable` (406)
- `ProxyAuthRequired` (407)
- `RequestTimeout` (408)
- `Conflict` (409)
- `Gone` (410)
- `LengthRequired` (411)
- `PreconditionFailed` (412)
- `ContentTooLarge` (413)
- `URITooLong` (414)
- `UnsupportedMediaType` (415)
- `RangeNotSatisfiable` (416)
- `ExpectationFailed` (417)
- `Teapot` (418)
- `MisdirectedRequest` (421)
- `UnprocessableEntity` (422)
- `Locked` (423)
- `FailedDependency` (424)
- `TooEarly` (425)
- `UpgradeRequired` (426)
- `PreconditionRequired` (428)
- `TooManyRequests` (429)
- `RequestHeaderFieldsTooLarge` (431)
- `UnavailableForLegalReasons` (451)

**5xx Server Error:**
- `InternalServerError` (500)
- `NotImplemented` (501)
- `BadGateway` (502)
- `ServiceUnavailable` (503)
- `GatewayTimeout` (504)
- `HTTPVersionNotSupported` (505)
- `VariantAlsoNegotiates` (506)
- `InsufficientStorage` (507)
- `LoopDetected` (508)
- `NotExtended` (510)
- `NetworkAuthenticationRequired` (511)

#### `Status.Text`
Object mapping status codes to their corresponding text descriptions.

**Example:**
```typescript
import { Status } from '@ooneex/http-status';

Status.Text[Status.Code.OK]; // "OK"
Status.Text[Status.Code.NotFound]; // "Not Found"
Status.Text[Status.Code.InternalServerError]; // "Internal Server Error"
Status.Text[Status.Code.Teapot]; // "I'm a teapot"
```

### Types

#### `StatusCodeType`
TypeScript type representing all valid HTTP status codes.

**Example:**
```typescript
import { StatusCodeType } from '@ooneex/http-status';

const code: StatusCodeType = 200; // Type-safe
const handler = (statusCode: StatusCodeType) => {
  // Handle status code
};
```

#### `StatusTextType`
TypeScript type representing all valid HTTP status text messages.

**Example:**
```typescript
import { StatusTextType } from '@ooneex/http-status';

const message: StatusTextType = "OK"; // Type-safe
```

### Interface

#### `IStatus`
Interface defining all available status code detection methods.

**Example:**
```typescript
import { IStatus } from '@ooneex/http-status';

class CustomStatusHandler implements IStatus {
  isInformational(code: StatusCodeType): boolean {
    // Custom implementation
    return code >= 100 && code < 200;
  }

  isSuccessful(code: StatusCodeType): boolean {
    // Custom implementation
    return code >= 200 && code < 300;
  }

  // ... implement other required methods
}
```

## Common Use Cases

### API Response Handling

```typescript
import { Status } from '@ooneex/http-status';

const status = new Status();

function handleApiResponse(statusCode: number, data: any) {
  if (status.isSuccessful(statusCode)) {
    console.log('Success:', data);
    return { success: true, data };
  }

  if (status.isClientError(statusCode)) {
    console.error('Client Error:', Status.Text[statusCode]);
    return { success: false, error: 'Client error occurred' };
  }

  if (status.isServerError(statusCode)) {
    console.error('Server Error:', Status.Text[statusCode]);
    return { success: false, error: 'Server error occurred' };
  }

  if (status.isRedirect(statusCode)) {
    console.log('Redirect:', Status.Text[statusCode]);
    return { success: true, redirect: true };
  }
}
```

### HTTP Client Wrapper

```typescript
import { Status } from '@ooneex/http-status';

class HttpClient {
  private status = new Status();

  async request(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, options);

      return {
        status: response.status,
        statusText: Status.Text[response.status],
        isSuccess: this.status.isSuccessful(response.status),
        isError: this.status.isError(response.status),
        isClientError: this.status.isClientError(response.status),
        isServerError: this.status.isServerError(response.status),
        data: response.ok ? await response.json() : null
      };
    } catch (error) {
      return {
        status: Status.Code.InternalServerError,
        statusText: Status.Text[Status.Code.InternalServerError],
        isSuccess: false,
        isError: true,
        isClientError: false,
        isServerError: true,
        data: null,
        error
      };
    }
  }
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
