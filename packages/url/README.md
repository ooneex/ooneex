# @ooneex/url

A comprehensive TypeScript/JavaScript library for parsing and working with URLs. This package provides a robust URL parsing utility that extracts all URL components including protocol, domain, subdomain, path, query parameters, and fragments with intelligent type conversion.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Complete URL Parsing** - Extracts all URL components with precision

✅ **Smart Type Conversion** - Automatically converts query parameters to appropriate types (string, number, bigint, boolean)

✅ **Subdomain Detection** - Intelligently separates subdomains from main domains

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Lightweight** - Minimal dependencies and optimized bundle size

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Native URL Integration** - Built on top of the native URL API

✅ **Flexible Input** - Accepts both string URLs and native URL objects

## Installation

### Bun
```bash
bun add @ooneex/url
```

### pnpm
```bash
pnpm add @ooneex/url
```

### Yarn
```bash
yarn add @ooneex/url
```

### npm
```bash
npm install @ooneex/url
```

## Usage

### Basic Usage

```typescript
import { Url } from '@ooneex/url';

// Parse a URL from string
const url = new Url('https://blog.example.com:3000/posts/123?active=true&limit=10#comments');

console.log(url.protocol);   // "https"
console.log(url.subdomain);  // "blog"
console.log(url.domain);     // "example.com"
console.log(url.hostname);   // "blog.example.com"
console.log(url.port);       // 3000
console.log(url.path);       // "/posts/123"
console.log(url.queries);    // { active: true, limit: 10 }
console.log(url.fragment);   // "comments"
console.log(url.base);       // "https://blog.example.com:3000"
console.log(url.origin);     // "https://blog.example.com:3000"
```

### Working with Query Parameters

```typescript
import { Url } from '@ooneex/url';

const url = new Url('https://api.example.com/users?name=john&age=25&active=true&score=98.5');

// Query parameters are automatically type-converted
console.log(url.queries.name);    // "john" (string)
console.log(url.queries.age);     // 25 (number)
console.log(url.queries.active);  // true (boolean)
console.log(url.queries.score);   // 98.5 (number)

// Access all queries
Object.entries(url.queries).forEach(([key, value]) => {
  console.log(`${key}: ${value} (${typeof value})`);
});
```

### Subdomain Handling

```typescript
import { Url } from '@ooneex/url';

// Single subdomain
const blog = new Url('https://blog.example.com');
console.log(blog.subdomain); // "blog"
console.log(blog.domain);    // "example.com"

// Multiple subdomains
const api = new Url('https://dev.api.example.com');
console.log(api.subdomain);  // "dev.api"
console.log(api.domain);     // "example.com"

// No subdomain
const main = new Url('https://example.com');
console.log(main.subdomain); // null
console.log(main.domain);    // "example.com"
```

### Working with Native URL Objects

```typescript
import { Url } from '@ooneex/url';

// Create from native URL object
const nativeUrl = new URL('https://example.com/path?query=value');
const url = new Url(nativeUrl);

// Access the original native URL
console.log(url.native); // Original URL object
console.log(url.native.searchParams.get('query')); // "value"
```

### Advanced Usage

```typescript
import { Url, IUrl } from '@ooneex/url';

class UrlAnalyzer {
  private url: IUrl;

  constructor(urlString: string) {
    this.url = new Url(urlString);
  }

  isSecure(): boolean {
    return this.url.protocol === 'https';
  }

  isLocalhost(): boolean {
    return this.url.domain === 'localhost' || this.url.domain === '127.0.0.1';
  }

  hasSubdomain(): boolean {
    return this.url.subdomain !== null;
  }

  getQueryCount(): number {
    return Object.keys(this.url.queries).length;
  }

  hasFragment(): boolean {
    return this.url.fragment.length > 0;
  }

  analyze(): object {
    return {
      url: this.url.base + this.url.path,
      secure: this.isSecure(),
      localhost: this.isLocalhost(),
      subdomain: this.hasSubdomain() ? this.url.subdomain : 'none',
      queryParams: this.getQueryCount(),
      hasFragment: this.hasFragment(),
      components: {
        protocol: this.url.protocol,
        domain: this.url.domain,
        port: this.url.port,
        path: this.url.path,
        queries: this.url.queries,
        fragment: this.url.fragment
      }
    };
  }
}

// Usage
const analyzer = new UrlAnalyzer('https://api.example.com:8080/v1/users?limit=10&active=true#section1');
console.log(analyzer.analyze());
```

## API Reference

### `Url` Class

The main class for parsing and working with URLs.

#### Constructor

##### `new Url(url: string | URL)`

Creates a new Url instance from a string or native URL object.

**Parameters:**
- `url` - The URL to parse (string or native URL object)

**Example:**
```typescript
const url1 = new Url('https://example.com/path');
const url2 = new Url(new URL('https://example.com/path'));
```

#### Properties

All properties are read-only and computed during construction.

##### `protocol: string`
The protocol scheme without the trailing colon.

**Example:**
```typescript
const url = new Url('https://example.com');
console.log(url.protocol); // "https"
```

##### `subdomain: string | null`
The subdomain portion, or null if no subdomain exists.

**Example:**
```typescript
const url = new Url('https://blog.example.com');
console.log(url.subdomain); // "blog"

const url2 = new Url('https://example.com');
console.log(url2.subdomain); // null
```

##### `domain: string`
The main domain name.

**Example:**
```typescript
const url = new Url('https://blog.example.com');
console.log(url.domain); // "example.com"
```

##### `hostname: string`
The complete hostname including subdomains.

**Example:**
```typescript
const url = new Url('https://blog.example.com');
console.log(url.hostname); // "blog.example.com"
```

##### `port: number`
The port number (defaults to 80 if not specified).

**Example:**
```typescript
const url1 = new Url('https://example.com:3000');
console.log(url1.port); // 3000

const url2 = new Url('https://example.com');
console.log(url2.port); // 80
```

##### `path: string`
The URL path, always starting with a forward slash.

**Example:**
```typescript
const url = new Url('https://example.com/users/123');
console.log(url.path); // "/users/123"

const url2 = new Url('https://example.com');
console.log(url2.path); // "/"
```

##### `queries: Record<string, boolean | number | bigint | string>`
An object containing all query parameters with automatic type conversion.

**Example:**
```typescript
const url = new Url('https://example.com?name=john&age=25&active=true');
console.log(url.queries); // { name: "john", age: 25, active: true }
```

##### `fragment: string`
The URL fragment (hash) without the leading '#'.

**Example:**
```typescript
const url = new Url('https://example.com#section1');
console.log(url.fragment); // "section1"
```

##### `base: string`
The base URL including protocol, hostname, and port.

**Example:**
```typescript
const url = new Url('https://example.com:3000/path?query=value');
console.log(url.base); // "https://example.com:3000"
```

##### `origin: string`
The origin of the URL (protocol + hostname + port).

**Example:**
```typescript
const url = new Url('https://example.com:3000/path');
console.log(url.origin); // "https://example.com:3000"
```

##### `native: URL`
The original native URL object.

**Example:**
```typescript
const url = new Url('https://example.com');
console.log(url.native instanceof URL); // true
```

### Interface

#### `IUrl`
Interface defining the structure of a parsed URL.

**Example:**
```typescript
import { IUrl } from '@ooneex/url';

function processUrl(url: IUrl) {
  console.log(`Processing ${url.protocol}://${url.hostname}${url.path}`);
  return url.queries;
}
```

## Type Conversion

The `@ooneex/url` package automatically converts query parameter values to appropriate types:

- **Numbers**: String values that represent valid numbers are converted to `number`
- **Booleans**: String values "true" and "false" are converted to `boolean`
- **BigInt**: String values that represent large integers are converted to `bigint` when appropriate
- **Strings**: All other values remain as `string`

```typescript
const url = new Url('https://example.com?count=42&active=true&name=john&id=9007199254740992');

console.log(typeof url.queries.count);  // "number"
console.log(typeof url.queries.active); // "boolean"
console.log(typeof url.queries.name);   // "string"
console.log(typeof url.queries.id);     // "bigint" (if the number is too large for regular number)
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
