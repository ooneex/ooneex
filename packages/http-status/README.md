# @ooneex/http-status

[![Browser Compatible](https://img.shields.io/badge/Browser-Compatible-brightgreen)](https://shields.io/badges) [![Bun Compatible](https://img.shields.io/badge/Bun-Compatible-orange)](https://bun.sh/) [![Deno Compatible](https://img.shields.io/badge/Deno-Compatible-blue)](https://deno.land/) [![Node.js Compatible](https://img.shields.io/badge/Node.js-Compatible-green)](https://nodejs.org/)

A comprehensive TypeScript library for HTTP status codes and utilities. This package provides easy-to-use constants, status text mappings, and utility methods for working with HTTP status codes in your applications.

## Features

- ✅ Complete HTTP status code constants (1xx, 2xx, 3xx, 4xx, 5xx)
- ✅ Human-readable status text mappings
- ✅ Utility methods for status code categorization
- ✅ Full TypeScript support with type safety
- ✅ Zero dependencies
- ✅ Browser, Bun, Deno and Node.js compatible
- ✅ ESM module support

## Installation

```bash
npm install @ooneex/http-status
```

```bash
yarn add @ooneex/http-status
```

```bash
bun add @ooneex/http-status
```

```bash
pnpm add @ooneex/http-status
```

## Usage

### Basic Usage

```typescript
import { Status } from '@ooneex/http-status';

const status = new Status();

// Check if a status code is successful
console.log(status.isSuccessful(Status.Code.OK)); // true
console.log(status.isSuccessful(Status.Code.NotFound)); // false

// Check if a status code is an error
console.log(status.isError(Status.Code.InternalServerError)); // true
console.log(status.isError(Status.Code.OK)); // false

// Get status text
console.log(Status.Text[Status.Code.OK]); // "OK"
console.log(Status.Text[Status.Code.NotFound]); // "Not Found"
```

### Working with Status Codes

```typescript
import { Status, type StatusCodeType } from '@ooneex/http-status';

const status = new Status();

// Using predefined status codes
const responseCode = Status.Code.Created;
console.log(`Response: ${responseCode} ${Status.Text[responseCode]}`);
// Output: "Response: 201 Created"

// Check status categories
if (status.isSuccessful(responseCode)) {
  console.log('Request was successful!');
}

if (status.isError(responseCode)) {
  console.log('An error occurred');
}
```

### Testing with Status Codes

```typescript
import { Status } from '@ooneex/http-status';
import { describe, test, expect } from 'bun:test';

describe('API Tests', () => {
  const status = new Status();

  test('should return 200 for successful requests', async () => {
    const response = await fetch('/api/health');
    expect(response.status).toBe(Status.Code.OK);
    expect(status.isSuccessful(response.status)).toBe(true);
  });

  test('should return 404 for non-existent resources', async () => {
    const response = await fetch('/api/nonexistent');
    expect(response.status).toBe(Status.Code.NotFound);
    expect(status.isClientError(response.status)).toBe(true);
  });

  test('should handle server errors', async () => {
    // Mock server error
    const mockStatus = Status.Code.InternalServerError;
    expect(status.isServerError(mockStatus)).toBe(true);
    expect(Status.Text[mockStatus]).toBe('Internal Server Error');
  });
});
```

### Working with Types

```typescript
import { Status, type StatusCodeType, type StatusTextType } from '@ooneex/http-status';

const status = new Status();

// Function that accepts any valid status code
function handleResponse(code: StatusCodeType): void {
  console.log(`Status: ${code} - ${Status.Text[code]}`);

  if (status.isSuccessful(code)) {
    console.log('✅ Success');
  } else if (status.isError(code)) {
    console.log('❌ Error');
  }
}

// Usage with type safety
handleResponse(Status.Code.OK); // ✅ Valid
handleResponse(Status.Code.NotFound); // ✅ Valid
handleResponse(200); // ✅ Valid (number literal)
// handleResponse(999); // ❌ TypeScript error - invalid status code

// Working with status text types
function getStatusMessage(code: StatusCodeType): StatusTextType {
  return Status.Text[code];
}

// Type-safe status text usage
const successMessage: StatusTextType = getStatusMessage(Status.Code.Created);
console.log(successMessage); // "Created"

// Creating custom handlers with proper typing
const errorHandler = (code: StatusCodeType): boolean => {
  const isError = status.isError(code);
  if (isError) {
    const message: StatusTextType = Status.Text[code];
    console.error(`Error ${code}: ${message}`);
  }
  return isError;
};

// Usage in API responses
interface APIResponse<T = any> {
  status: StatusCodeType;
  message: StatusTextType;
  data?: T;
}

function createResponse<T>(code: StatusCodeType, data?: T): APIResponse<T> {
  return {
    status: code,
    message: Status.Text[code],
    data
  };
}

const successResponse = createResponse(Status.Code.OK, { id: 1, name: "John" });
const errorResponse = createResponse(Status.Code.BadRequest);
```

## API Reference

### Status Class

The main class providing utility methods for status code categorization.

#### Static Properties

- `Status.Code`: Object containing all HTTP status code constants
- `Status.Text`: Object mapping status codes to their text descriptions

#### Instance Methods

- `isInformational(code: StatusCodeType): boolean` - Returns true for 1xx status codes
- `isSuccessful(code: StatusCodeType): boolean` - Returns true for 2xx status codes
- `isRedirect(code: StatusCodeType): boolean` - Returns true for 3xx status codes
- `isClientError(code: StatusCodeType): boolean` - Returns true for 4xx status codes
- `isServerError(code: StatusCodeType): boolean` - Returns true for 5xx status codes
- `isError(code: StatusCodeType): boolean` - Returns true for 4xx or 5xx status codes

### Available Status Codes

#### 1xx Informational
- `Continue` (100)
- `SwitchingProtocols` (101)
- `Processing` (102)
- `EarlyHints` (103)

#### 2xx Success
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

#### 3xx Redirection
- `MultipleChoices` (300)
- `MovedPermanently` (301)
- `Found` (302)
- `SeeOther` (303)
- `NotModified` (304)
- `UseProxy` (305)
- `TemporaryRedirect` (307)
- `PermanentRedirect` (308)

#### 4xx Client Error
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

#### 5xx Server Error
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
