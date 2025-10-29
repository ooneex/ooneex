# @ooneex/http-header

A comprehensive TypeScript/JavaScript library for working with HTTP headers. This package provides powerful classes and utilities to easily manipulate, read, and manage HTTP headers with type safety and convenient methods for common operations.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Complete Header Management** - Full support for reading and writing HTTP headers

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **User Agent Parsing** - Built-in user agent detection and parsing

✅ **Content Type Handling** - Easy MIME type and charset management

✅ **Authentication Support** - Built-in methods for Basic Auth, Bearer tokens

✅ **Cookie Management** - Comprehensive cookie parsing and setting

✅ **CORS Support** - Easy Cross-Origin Resource Sharing header management

✅ **Security Headers** - Built-in support for common security headers

✅ **Caching Headers** - Cache control and ETags management

✅ **Client IP Detection** - Multiple methods to detect client IP addresses

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Zero Config** - Works out of the box with sensible defaults

## Installation

### Bun
```bash
bun add @ooneex/http-header
```

### pnpm
```bash
pnpm add @ooneex/http-header
```

### Yarn
```bash
yarn add @ooneex/http-header
```

### npm
```bash
npm install @ooneex/http-header
```

## Usage

### Basic Usage

```typescript
import { Header, ReadonlyHeader } from '@ooneex/http-header';

// Create a new header instance
const headers = new Header();

// Set content type
headers.setJson(); // Sets application/json with UTF-8 charset
headers.setHtml('iso-8859-1'); // Sets text/html with custom charset

// Set authentication
headers.setBearerToken('your-jwt-token');
headers.setBasicAuth('base64-encoded-credentials');

// Set cookies
headers.setCookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: true,
  maxAge: 3600
});

// Set CORS headers
headers.setAccessControlAllowOrigin('*');
headers.setAccessControlAllowMethods(['GET', 'POST', 'PUT']);
```

### Reading Headers

```typescript
import { ReadonlyHeader } from '@ooneex/http-header';

// Create from existing Headers object
const readonlyHeaders = new ReadonlyHeader(request.headers);

// Get content information
const contentType = readonlyHeaders.getContentType(); // 'application/json'
const contentLength = readonlyHeaders.getContentLength(); // number
const charset = readonlyHeaders.getCharset(); // 'UTF-8'

// Get authentication info
const bearerToken = readonlyHeaders.getBearerToken();
const basicAuth = readonlyHeaders.getBasicAuth();

// Get cookies
const allCookies = readonlyHeaders.getCookies(); // Record<string, string>
const sessionId = readonlyHeaders.getCookie('sessionId');

// Get user agent information
const userAgent = readonlyHeaders.getUserAgent();
console.log(userAgent.browser.name); // 'Chrome'
console.log(userAgent.os.name); // 'Windows'
console.log(userAgent.device.type); // 'desktop'
```

### Advanced Usage

```typescript
import { Header } from '@ooneex/http-header';

const headers = new Header();

// Chain multiple operations
headers
  .setJson('utf-8')
  .setBearerToken('jwt-token')
  .setCacheControl('public, max-age=3600')
  .setAccessControlAllowOrigin('https://example.com')
  .setContentSecurityPolicy("default-src 'self'");

// Set multiple cookies at once
headers.setCookies([
  {
    name: 'session',
    value: 'abc123',
    options: { httpOnly: true, secure: true }
  },
  {
    name: 'theme',
    value: 'dark',
    options: { maxAge: 86400 }
  }
]);

// Security headers
headers.setStrictTransportSecurity(31536000, true, true);
headers.setXFrameOptions('DENY');
headers.setXContentTypeOptions('nosniff');

// Custom headers
headers.add('X-API-Version', '2.0');
headers.set('X-Request-ID', 'unique-id');
```

### Client IP Detection

```typescript
import { ReadonlyHeader } from '@ooneex/http-header';

const headers = new ReadonlyHeader(request.headers);

// Get client IP (checks X-Forwarded-For, X-Real-IP)
const clientIp = headers.getIp();

// Get all possible client IPs
const allIps = headers.getClientIps(); // string[]

// Check specific headers
const forwardedFor = headers.getXForwardedFor();
const realIp = headers.getXRealIP();
```

### Request Type Detection

```typescript
import { ReadonlyHeader } from '@ooneex/http-header';

const headers = new ReadonlyHeader(request.headers);

// Check request characteristics
const isSecure = headers.isSecure(); // HTTPS check
const isAjax = headers.isAjax(); // XMLHttpRequest check
const isCors = headers.isCorsRequest(); // CORS request check
```

## API Reference

### `Header` Class

The main class for creating and modifying HTTP headers.

#### Constructor

```typescript
new Header(headers?: Headers)
```

Creates a new Header instance, optionally from existing Headers object.

#### Core Methods

##### `add(name: HeaderFieldType, value: string): Header`
Adds a header value (allows multiple values for the same header).

```typescript
headers.add('Set-Cookie', 'session=abc123');
headers.add('Set-Cookie', 'theme=dark');
```

##### `set(name: HeaderFieldType, value: string): Header`
Sets a header value (replaces existing value).

```typescript
headers.set('Authorization', 'Bearer token123');
```

##### `remove(name: HeaderFieldType): Header`
Removes a header completely.

```typescript
headers.remove('Authorization');
```

#### Content Type Methods

##### `setJson(charset?: CharsetType): Header`
Sets content type to `application/json`.

```typescript
headers.setJson(); // application/json; charset=utf-8
headers.setJson('iso-8859-1'); // application/json; charset=iso-8859-1
```

##### `setHtml(charset?: CharsetType): Header`
Sets content type to `text/html`.

##### `setText(charset?: CharsetType): Header`
Sets content type to `text/plain`.

##### `setForm(charset?: CharsetType): Header`
Sets content type to `application/x-www-form-urlencoded`.

##### `setFormData(charset?: CharsetType): Header`
Sets content type to `multipart/form-data`.

##### `setBlobType(charset?: CharsetType): Header`
Sets content type to `application/octet-stream`.

##### `contentType(type: MimeType, charset?: CharsetType): Header`
Sets custom content type with optional charset.

```typescript
headers.contentType('application/xml', 'utf-8');
```

##### `contentLength(length: number): Header`
Sets the Content-Length header.

```typescript
headers.contentLength(1024);
```

#### Authentication Methods

##### `setBearerToken(token: string): Header`
Sets Bearer token authorization.

```typescript
headers.setBearerToken('your-jwt-token');
```

##### `setBasicAuth(token: string): Header`
Sets Basic authentication.

```typescript
headers.setBasicAuth(btoa('username:password'));
```

##### `setAuthorization(value: string): Header`
Sets custom authorization header.

```typescript
headers.setAuthorization('Custom auth-scheme token');
```

#### Cookie Methods

##### `setCookie(name: string, value: string, options?): Header`
Sets a single cookie with options.

```typescript
headers.setCookie('session', 'abc123', {
  domain: '.example.com',
  path: '/',
  maxAge: 3600,
  secure: true,
  httpOnly: true,
  sameSite: 'Strict'
});
```

##### `setCookies(cookies: Array<{name, value, options?}>): Header`
Sets multiple cookies at once.

#### CORS Methods

##### `setAccessControlAllowOrigin(origin: string): Header`
Sets allowed origins for CORS.

```typescript
headers.setAccessControlAllowOrigin('*');
headers.setAccessControlAllowOrigin('https://example.com');
```

##### `setAccessControlAllowMethods(methods: MethodType[]): Header`
Sets allowed HTTP methods for CORS.

```typescript
headers.setAccessControlAllowMethods(['GET', 'POST', 'PUT', 'DELETE']);
```

##### `setAccessControlAllowHeaders(headers: string[]): Header`
Sets allowed headers for CORS.

##### `setAccessControlAllowCredentials(allow: boolean): Header`
Sets whether credentials are allowed in CORS requests.

#### Security Headers

##### `setContentSecurityPolicy(policy: string): Header`
Sets Content Security Policy.

```typescript
headers.setContentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline'");
```

##### `setStrictTransportSecurity(maxAge: number, includeSubDomains?: boolean, preload?: boolean): Header`
Sets HSTS header.

```typescript
headers.setStrictTransportSecurity(31536000, true, true);
```

##### `setXFrameOptions(value: 'DENY' | 'SAMEORIGIN' | string): Header`
Sets X-Frame-Options header.

##### `setXContentTypeOptions(value?: string): Header`
Sets X-Content-Type-Options header (defaults to 'nosniff').

##### `setXXSSProtection(enabled?: boolean, mode?: string): Header`
Sets X-XSS-Protection header.

#### Caching Methods

##### `setCacheControl(value: string): Header`
Sets Cache-Control header.

```typescript
headers.setCacheControl('public, max-age=3600');
```

##### `setEtag(value: string): Header`
Sets ETag header.

##### `setLastModified(date: Date): Header`
Sets Last-Modified header.

### `ReadonlyHeader` Class

Read-only access to HTTP headers with parsing capabilities.

#### Constructor

```typescript
new ReadonlyHeader(headers: Headers)
```

#### Core Methods

##### `get(name: HeaderFieldType): string | null`
Gets a header value.

##### `has(name: HeaderFieldType): boolean`
Checks if a header exists.

##### `toJson(): Partial<Record<HeaderFieldType, string>>`
Converts headers to a plain object.

#### Content Methods

##### `getContentType(): MimeType | "*/*" | null`
Gets the content type.

##### `getContentLength(): number`
Gets the content length (returns 0 if not set).

##### `getCharset(): CharsetType | null`
Extracts charset from Content-Type header.

##### `getAccept(): MimeType | "*/*" | null`
Gets the Accept header value.

##### `getAcceptLanguage(): string[] | null`
Gets accepted languages as an array.

##### `getAcceptEncoding(): EncodingType[] | null`
Gets accepted encodings as an array.

#### Authentication Methods

##### `getAuthorization(): string | null`
Gets the Authorization header.

##### `getBearerToken(): string | null`
Extracts Bearer token from Authorization header.

##### `getBasicAuth(): string | null`
Extracts Basic auth credentials from Authorization header.

#### Cookie Methods

##### `getCookies(): Record<string, string> | null`
Gets all cookies as an object.

##### `getCookie(name: string): string | null`
Gets a specific cookie value.

#### User Agent Methods

##### `getUserAgent(): IUserAgent`
Parses User-Agent header and returns detailed information.

```typescript
const ua = headers.getUserAgent();
console.log(ua.browser.name); // 'Chrome'
console.log(ua.browser.version); // '91.0.4472.124'
console.log(ua.os.name); // 'Windows'
console.log(ua.device.type); // 'desktop'
```

#### IP Detection Methods

##### `getIp(): string | null`
Gets client IP from X-Forwarded-For or X-Real-IP.

##### `getClientIps(): string[]`
Gets all possible client IP addresses.

##### `getXForwardedFor(): string | null`
Gets X-Forwarded-For header.

##### `getXRealIP(): string | null`
Gets X-Real-IP header.

#### Request Detection Methods

##### `isSecure(): boolean`
Checks if request is HTTPS (via X-Forwarded-Proto).

##### `isAjax(): boolean`
Checks if request is AJAX (XMLHttpRequest).

##### `isCorsRequest(): boolean`
Checks if request is a CORS request (has Origin header).

## Types

### `HeaderFieldType`
Union type of all standard HTTP header names plus custom headers.

### `IUserAgent`
Interface for parsed user agent information:

```typescript
interface IUserAgent {
  browser: { name?: string; version?: string; major?: string };
  engine: { name?: string; version?: string };
  os: { name?: string; version?: string };
  device: { vendor?: string; model?: string; type?: string };
  cpu: { architecture?: string };
}
```

### `MethodType`
HTTP methods: `'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'`

### `CharsetType`
Character encodings: `'ISO-8859-1' | '7-BIT' | 'UTF-8' | 'UTF-16' | 'US-ASCII'`

### `EncodingType`
Content encodings: `'deflate' | 'gzip' | 'compress' | 'br' | 'identity' | '*'`

## Examples

### Express.js Integration

```typescript
import express from 'express';
import { Header, ReadonlyHeader } from '@ooneex/http-header';

const app = express();

app.get('/api/data', (req, res) => {
  const requestHeaders = new ReadonlyHeader(req.headers);
  const responseHeaders = new Header();

  // Check if client accepts JSON
  const accept = requestHeaders.getAccept();
  if (accept?.includes('application/json')) {
    responseHeaders.setJson();
  }

  // Set security headers
  responseHeaders
    .setAccessControlAllowOrigin('*')
    .setContentSecurityPolicy("default-src 'self'")
    .setXFrameOptions('DENY');

  // Apply headers to response
  for (const [name, value] of responseHeaders) {
    res.setHeader(name, value);
  }

  res.json({ message: 'Hello World' });
});
```

### Next.js API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Header, ReadonlyHeader } from '@ooneex/http-header';

export async function GET(request: NextRequest) {
  const requestHeaders = new ReadonlyHeader(request.headers);
  const responseHeaders = new Header();

  // Get user agent info
  const userAgent = requestHeaders.getUserAgent();

  // Set response headers
  responseHeaders
    .setJson()
    .setCacheControl('public, max-age=300')
    .setAccessControlAllowOrigin('*');

  const response = NextResponse.json({
    browser: userAgent.browser.name,
    os: userAgent.os.name
  });

  // Apply headers
  for (const [name, value] of responseHeaders) {
    response.headers.set(name, value);
  }

  return response;
}
```

### Bun HTTP Server

```typescript
import { Header, ReadonlyHeader } from '@ooneex/http-header';

Bun.serve({
  port: 3000,
  async fetch(request) {
    const requestHeaders = new ReadonlyHeader(request.headers);
    const responseHeaders = new Header();

    // Check authentication
    const bearerToken = requestHeaders.getBearerToken();
    if (!bearerToken) {
      responseHeaders.setJson();
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: responseHeaders.native
        }
      );
    }

    // Success response
    responseHeaders
      .setJson()
      .setCacheControl('private, no-cache');

    return new Response(
      JSON.stringify({ message: 'Success' }),
      { headers: responseHeaders.native }
    );
  }
});
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
