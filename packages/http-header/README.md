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

✅ **User Agent Parsing** - Built-in user agent detection and parsing with device information

✅ **Content Type Handling** - Easy MIME type and charset management

✅ **Authentication Support** - Built-in methods for Basic Auth, Bearer tokens

✅ **Cookie Management** - Comprehensive cookie parsing and setting with all options

✅ **CORS Support** - Easy Cross-Origin Resource Sharing header management

✅ **Security Headers** - Built-in support for common security headers (CSP, HSTS, XSS)

✅ **Caching Headers** - Cache control and ETags management

✅ **Client IP Detection** - Multiple methods to detect client IP addresses

✅ **Method Chaining** - Fluent API for easy header manipulation

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

### Basic Header Operations

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Adding headers
header.add('Content-Type', 'application/json')
      .add('Accept', 'application/json')
      .set('Authorization', 'Bearer token123');

// Reading headers
const contentType = header.get('Content-Type'); // "application/json"
const hasAuth = header.has('Authorization'); // true

// Converting to JSON
const headerObj = header.toJson();
console.log(headerObj); // { "Content-Type": "application/json", ... }
```

### Content Type Management

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Setting content types with optional charset
header.contentType('application/json', 'UTF-8');

// Convenience methods
header.setJson('UTF-8')        // application/json; charset=UTF-8
      .setHtml('UTF-8')        // text/html; charset=UTF-8
      .setText('UTF-8')        // text/plain; charset=UTF-8
      .setForm('UTF-8')        // application/x-www-form-urlencoded; charset=UTF-8
      .setFormData()           // multipart/form-data
      .setBlobType();          // application/octet-stream

// Content negotiation
header.setAccept('application/json')
      .setLang('en-US')
      .setAcceptEncoding(['gzip', 'br', 'deflate']);
```

### Authentication Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Basic authentication
header.setBasicAuth('dXNlcjpwYXNz'); // Sets "Authorization: Basic dXNlcjpwYXNz"

// Bearer token
header.setBearerToken('your-jwt-token'); // Sets "Authorization: Bearer your-jwt-token"

// Custom authorization
header.setAuthorization('Custom token123');

// Reading authentication (using ReadonlyHeader)
console.log(header.getBasicAuth()); // Returns token or null
console.log(header.getBearerToken()); // Returns token or null
console.log(header.getAuthorization()); // Returns full header or null
```

### Cookie Management

```typescript
import { Header, ReadonlyHeader } from '@ooneex/http-header';

const header = new Header();

// Setting cookies with options
header.setCookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: true,
  maxAge: 3600,
  path: '/',
  domain: '.example.com',
  sameSite: 'Strict'
});

// Setting multiple cookies
header.setCookies([
  { name: 'user', value: 'john', options: { maxAge: 86400 } },
  { name: 'theme', value: 'dark', options: { path: '/app' } }
]);

// Reading cookies (from request headers)
const readonlyHeader = new ReadonlyHeader(requestHeaders);
const cookies = readonlyHeader.getCookies(); // { sessionId: 'abc123', user: 'john' }
const userCookie = readonlyHeader.getCookie('user'); // 'john'

// Removing cookies
header.removeCookie('sessionId', { path: '/', domain: '.example.com' });
```

### CORS Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// CORS configuration
header.setAccessControlAllowOrigin('*')
      .setAccessControlAllowMethods(['GET', 'POST', 'PUT', 'DELETE'])
      .setAccessControlAllowHeaders(['Content-Type', 'Authorization'])
      .setAccessControlAllowCredentials(true);

// Reading CORS settings
console.log(header.getAccessControlAllowOrigin()); // '*'
console.log(header.getAccessControlAllowMethods()); // ['GET', 'POST', 'PUT', 'DELETE']
```

### Security Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Security headers setup
header.setContentSecurityPolicy("default-src 'self'; script-src 'unsafe-inline'")
      .setStrictTransportSecurity(31536000, true, true) // 1 year, includeSubDomains, preload
      .setXContentTypeOptions('nosniff')
      .setXFrameOptions('DENY')
      .setXXSSProtection(true, 'block');

// Reading security headers
console.log(header.getContentSecurityPolicy());
console.log(header.getStrictTransportSecurity());
```

### Caching Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Cache control
header.setCacheControl('public, max-age=3600')
      .setEtag('"abc123"')
      .setLastModified(new Date())
      .setIfModifiedSince(new Date(Date.now() - 86400000));

// Reading cache headers
console.log(header.getCacheControl()); // 'public, max-age=3600'
console.log(header.getEtag()); // '"abc123"'
console.log(header.getLastModified()); // Date object
```

### Request Information

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Request headers
header.setHost('api.example.com')
      .setUserAgent('MyApp/1.0')
      .setReferer('https://example.com/page')
      .setOrigin('https://example.com');

// Reading request info
console.log(header.getHost()); // 'api.example.com'
console.log(header.getUserAgent()); // Parsed user agent object
console.log(header.getReferer()); // 'https://example.com/page'
```

### Client IP Detection

```typescript
import { ReadonlyHeader } from '@ooneex/http-header';

const requestHeader = new ReadonlyHeader(incomingHeaders);

// Get client IP (tries X-Forwarded-For, then X-Real-IP)
const clientIp = requestHeader.getIp();

// Get all possible IPs
const allIps = requestHeader.getClientIps();

// Specific headers
const forwardedFor = requestHeader.getXForwardedFor();
const realIp = requestHeader.getXRealIP();
```

### User Agent Parsing

```typescript
import { ReadonlyHeader } from '@ooneex/http-header';

const header = new ReadonlyHeader(requestHeaders);

const userAgent = header.getUserAgent();
if (userAgent) {
  console.log(userAgent.browser.name);    // 'Chrome'
  console.log(userAgent.browser.version); // '91.0.4472.124'
  console.log(userAgent.os.name);         // 'Windows'
  console.log(userAgent.device.type);     // 'mobile'
}
```

### Method Chaining

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Fluent API
header.setJson()
      .setBearerToken('token')
      .setCookie('session', 'abc123', { httpOnly: true })
      .setAccessControlAllowOrigin('*')
      .setCacheControl('no-cache');
```

### Working with Native Headers

```typescript
import { Header, ReadonlyHeader } from '@ooneex/http-header';

// From native Headers object
const nativeHeaders = new Headers();
nativeHeaders.set('Content-Type', 'application/json');

const header = new Header(nativeHeaders);

// Access native Headers instance
const native = header.native;

// Convert to plain object
const headerObject = header.toJson();

// Create readonly instance
const readonlyHeader = new ReadonlyHeader(nativeHeaders);
```

### Request Type Detection

```typescript
import { ReadonlyHeader } from '@ooneex/http-header';

// Typically used with incoming request headers
const requestHeader = new ReadonlyHeader(request.headers);

// Check request characteristics
console.log(requestHeader.isSecure()); // true if X-Forwarded-Proto: https
console.log(requestHeader.isAjax()); // true if X-Requested-With: XMLHttpRequest
console.log(requestHeader.isCorsRequest()); // true if Origin header present
```

## API Reference

### `Header` Class

The main mutable header class that extends `ReadonlyHeader`.

#### Constructor

```typescript
new Header(headers?: Headers)
```

Creates a new Header instance, optionally from existing Headers object.

#### Core Methods

- `add(name: string, value: string): this` - Add header (appends if exists)
- `set(name: string, value: string): this` - Set header (replaces if exists)
- `remove(name: string): this` - Remove header

#### Content Type Methods

- `contentType(type: MimeType, charset?: string): this` - Set content type
- `clearContentType(): this` - Remove Content-Type and Accept-Charset headers
- `contentLength(length: number): this` - Set content length
- `contentDisposition(value: string): this` - Set content disposition

#### Content Type Convenience Methods

- `setJson(charset?: string): this` - Set JSON content type
- `setHtml(charset?: string): this` - Set HTML content type
- `setText(charset?: string): this` - Set plain text content type
- `setForm(charset?: string): this` - Set form-encoded content type
- `setFormData(charset?: string): this` - Set multipart form content type
- `setBlobType(charset?: string): this` - Set binary content type

#### Authentication Methods

- `setAuthorization(value: string): this` - Set authorization header
- `setBasicAuth(token: string): this` - Set basic auth
- `setBearerToken(token: string): this` - Set bearer token

#### Cookie Methods

- `setCookie(name: string, value: string, options?: CookieOptions): this`
- `setCookies(cookies: CookieConfig[]): this`
- `addCookie(name: string, value: string, options?: CookieOptions): this`
- `removeCookie(name: string, options?: CookieOptions): this`

#### CORS Methods

- `setAccessControlAllowOrigin(origin: string): this`
- `setAccessControlAllowMethods(methods: string[]): this`
- `setAccessControlAllowHeaders(headers: string[]): this`
- `setAccessControlAllowCredentials(allow: boolean): this`

#### Security Methods

- `setContentSecurityPolicy(policy: string): this`
- `setStrictTransportSecurity(maxAge: number, includeSubDomains?: boolean, preload?: boolean): this`
- `setXContentTypeOptions(value?: string): this`
- `setXFrameOptions(value: string): this`
- `setXXSSProtection(enabled?: boolean, mode?: string): this`

#### Caching Methods

- `setCacheControl(value: string): this`
- `setEtag(value: string): this`
- `setLastModified(date: Date): this`
- `setIfModifiedSince(date: Date): this`

#### Request Methods

- `setHost(host: string): this`
- `setUserAgent(userAgent: string): this`
- `setReferer(referer: string): this`
- `setOrigin(origin: string): this`
- `setAccept(mimeType: string): this`
- `setAcceptLanguage(languages: string[]): this`
- `setAcceptEncoding(encodings: string[]): this`

#### Utility Methods

- `setLocation(location: string): this` - Set redirect location
- `setCustom(value: string): this` - Set X-Custom header

### `ReadonlyHeader` Class

Read-only header class for parsing and accessing header values.

#### Getter Methods

- `get(name: string): string | null` - Get header value
- `has(name: string): boolean` - Check if header exists
- `toJson(): Record<string, string>` - Convert to plain object

#### Content Methods

- `getContentType(): string | null`
- `getContentLength(): number`
- `getCharset(): string | null`
- `getContentDisposition(): string | null`

#### Authentication Methods

- `getAuthorization(): string | null`
- `getBasicAuth(): string | null`
- `getBearerToken(): string | null`

#### Cookie Methods

- `getCookies(): Record<string, string> | null`
- `getCookie(name: string): string | null`

#### Request Info Methods

- `getHost(): string | null`
- `getUserAgent(): UserAgent | null`
- `getReferer(): string | null`
- `getOrigin(): string | null`
- `getAccept(): string | null`
- `getAcceptLanguage(): string[]`
- `getAcceptEncoding(): string[]`

#### IP Detection Methods

- `getIp(): string | null`
- `getXForwardedFor(): string | null`
- `getXRealIP(): string | null`
- `getClientIps(): string[]`

#### CORS Methods

- `getAccessControlAllowOrigin(): string | null`
- `getAccessControlAllowMethods(): string[]`
- `getAccessControlAllowHeaders(): string[]`
- `getAccessControlAllowCredentials(): boolean | null`

#### Security Methods

- `getContentSecurityPolicy(): string | null`
- `getStrictTransportSecurity(): string | null`
- `getXContentTypeOptions(): string | null`
- `getXFrameOptions(): string | null`
- `getXXSSProtection(): string | null`

#### Caching Methods

- `getCacheControl(): string | null`
- `getEtag(): string | null`
- `getLastModified(): Date | null`
- `getIfModifiedSince(): Date | null`
- `getIfNoneMatch(): string | null`

#### Detection Methods

- `isSecure(): boolean` - Check if request is HTTPS
- `isAjax(): boolean` - Check if AJAX request
- `isCorsRequest(): boolean` - Check if CORS request

### Type Definitions

#### `CookieOptions`

```typescript
interface CookieOptions {
  domain?: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}
```

#### `UserAgent`

```typescript
interface UserAgent {
  browser: string;
  version: string;
  os: string;
  device?: string;
}
```

## Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { Header } from '@ooneex/http-header';

const app = express();

app.use((req, res, next) => {
  // Parse incoming headers
  const incomingHeader = new ReadonlyHeader(req.headers as any);

  // Create response headers
  const responseHeader = new Header();
  responseHeader
    .setAccessControlAllowOrigin('*')
    .setCacheControl('no-cache')
    .setXContentTypeOptions();

  // Apply to Express response
  Object.entries(responseHeader.toJson()).forEach(([name, value]) => {
    res.setHeader(name, value);
  });

  next();
});
```

### Fetch API Integration

```typescript
import { Header } from '@ooneex/http-header';

const requestHeader = new Header();
requestHeader
  .setJson()
  .setBearerToken('your-token')
  .setUserAgent('MyApp/1.0');

const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: requestHeader.native,
  body: JSON.stringify({ data: 'example' })
});

// Parse response headers
const responseHeader = new ReadonlyHeader(response.headers);
console.log(responseHeader.getContentType());
```

### Bun Server Integration

```typescript
import { Header, ReadonlyHeader } from '@ooneex/http-header';

Bun.serve({
  port: 3000,
  async fetch(req) {
    // Parse request headers
    const requestHeader = new ReadonlyHeader(req.headers);

    // Create response headers
    const responseHeader = new Header();
    responseHeader
      .setJson()
      .setCacheControl('public, max-age=3600')
      .setAccessControlAllowOrigin('*');

    if (requestHeader.isAjax()) {
      responseHeader.add('X-Requested-Via', 'Ajax');
    }

    return new Response(
      JSON.stringify({ message: 'Hello World' }),
      { headers: responseHeader.native }
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
3. Run tests: `bun run test`
4. Build the project: `bun run build`

### Guidelines

- Write
 tests for new features
- Follow the existing code style
- Update
 documentation for API changes
- Ensure all tests pass before submitting PR

---

Made with ❤️ by the Ooneex team
