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

// Add headers
header.add('X-Custom-Header', 'value');
header.set('User-Agent', 'MyApp/1.0');

// Read headers
console.log(header.get('User-Agent')); // 'MyApp/1.0'
console.log(header.has('X-Custom-Header')); // true

// Remove headers
header.remove('X-Custom-Header');
```

### Content Type Management

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Set content types
header.contentType('application/json');
header.contentType('text/html', 'UTF-8');

// Content type convenience methods
header.setJson(); // Sets application/json
header.setHtml('UTF-8'); // Sets text/html with charset
header.setText(); // Sets text/plain
header.setForm(); // Sets application/x-www-form-urlencoded
header.setFormData(); // Sets multipart/form-data

// Clear content type and charset
header.clearContentType(); // Removes Content-Type and Accept-Charset headers

// Check what's set
console.log(header.getContentType()); // Returns content type or null
console.log(header.getCharset()); // Returns charset or null
```

### Authentication Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Basic authentication
header.setBasicAuth('dXNlcjpwYXNzd29yZA=='); // base64 encoded
header.setAuthorization('Basic dXNlcjpwYXNzd29yZA==');

// Bearer token
header.setBearerToken('your-jwt-token-here');

// Custom authorization
header.setAuthorization('Custom token=abc123');

// Read authentication
console.log(header.getBasicAuth()); // Returns token or null
console.log(header.getBearerToken()); // Returns token or null
console.log(header.getAuthorization()); // Returns full header or null
```

### Cookie Management

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Set cookies
header.setCookie('session', 'abc123', {
  httpOnly: true,
  secure: true,
  maxAge: 3600,
  path: '/',
  domain: '.example.com',
  sameSite: 'Strict'
});

// Set multiple cookies
header.setCookies([
  { name: 'user', value: '12345', options: { maxAge: 86400 } },
  { name: 'theme', value: 'dark', options: { path: '/' } }
]);

// Remove cookies
header.removeCookie('session', { path: '/', domain: '.example.com' });

// Read cookies (from Cookie header)
const cookies = header.getCookies(); // Returns object with all cookies
const userCookie = header.getCookie('user'); // Returns specific cookie value
```

### CORS Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Set CORS headers
header.setAccessControlAllowOrigin('https://example.com');
header.setAccessControlAllowMethods(['GET', 'POST', 'PUT']);
header.setAccessControlAllowHeaders(['Content-Type', 'Authorization']);
header.setAccessControlAllowCredentials(true);

// Read CORS settings
console.log(header.getAccessControlAllowOrigin()); // 'https://example.com'
console.log(header.getAccessControlAllowMethods()); // ['GET', 'POST', 'PUT']
```

### Security Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Security headers
header.setContentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline'");
header.setStrictTransportSecurity(31536000, true, true); // max-age, includeSubDomains, preload
header.setXContentTypeOptions('nosniff');
header.setXFrameOptions('DENY');
header.setXXSSProtection(true, 'block');

// Read security headers
console.log(header.getContentSecurityPolicy());
console.log(header.getStrictTransportSecurity());
```

### Caching Headers

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Cache control
header.setCacheControl('public, max-age=3600');
header.setEtag('"abc123"');
header.setLastModified(new Date());

// Conditional requests
header.setIfModifiedSince(new Date('2024-01-01'));

// Read cache headers
console.log(header.getCacheControl()); // 'public, max-age=3600'
console.log(header.getEtag()); // '"abc123"'
console.log(header.getLastModified()); // Date object
```

### Request Information

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Request headers
header.setHost('api.example.com');
header.setUserAgent('MyApp/1.0 (Windows NT 10.0; Win64; x64)');
header.setReferer('https://example.com/page');
header.setOrigin('https://example.com');

// Content negotiation
header.setAccept('application/json');
header.setAcceptLanguage(['en-US', 'en', 'fr']);
header.setAcceptEncoding(['gzip', 'deflate', 'br']);

// Read request info
console.log(header.getHost()); // 'api.example.com'
console.log(header.getUserAgent()); // Parsed user agent object
console.log(header.getAcceptLanguage()); // ['en-US', 'en', 'fr']
```

### Client IP Detection

```typescript
import { Header } from '@ooneex/http-header';

// Typically used with incoming request headers
const requestHeader = new Header(request.headers);

// Get client IP (checks X-Forwarded-For, then X-Real-IP)
const clientIp = requestHeader.getIp(); // '192.168.1.100'

// Get all possible client IPs
const allIps = requestHeader.getClientIps(); // ['192.168.1.100', '10.0.0.1']

// Check specific headers
const forwardedFor = requestHeader.getXForwardedFor(); // '192.168.1.100, 10.0.0.1'
const realIp = requestHeader.getXRealIP(); // '192.168.1.100'
```

### Method Chaining

```typescript
import { Header } from '@ooneex/http-header';

const header = new Header();

// Chain multiple operations
const response = header
  .setJson('UTF-8')
  .setCacheControl('public, max-age=3600')
  .setAccessControlAllowOrigin('*')
  .setCookie('session', 'abc123', { httpOnly: true })
  .setCustom('MyApp Response');

// Later, clear content type and set new one
header
  .clearContentType()
  .setHtml('UTF-8')
  .setEtag('"new-etag"');
```

### Working with Native Headers

```typescript
import { Header, ReadonlyHeader } from '@ooneex/http-header';

// Create from existing Headers object
const nativeHeaders = new Headers();
nativeHeaders.set('Content-Type', 'application/json');

const header = new Header(nativeHeaders);

// Access native Headers object
const native = header.native; // Returns the underlying Headers object

// Convert to JSON
const headerObject = header.toJson(); // Returns plain object

// Readonly wrapper for parsing only
const readonlyHeader = new ReadonlyHeader(nativeHeaders);
console.log(readonlyHeader.getContentType()); // 'application/json'
// readonlyHeader.set() // Error: Method doesn't exist
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

---

Made with ❤️ by the Ooneex team
