# @ooneex/http-mimes

A comprehensive TypeScript/JavaScript library for working with HTTP MIME types. This package provides a complete collection of MIME types and utility methods to identify and work with different content types in web applications.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Complete MIME Type Collection** - Extensive list of standard MIME types

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Lightweight** - Minimal dependencies and optimized bundle size

✅ **Cross-Platform** - Works in Browser, Node.js, Bun, and Deno

✅ **Easy Detection** - Simple methods to identify content types

✅ **Case Insensitive** - Handles different case variations

✅ **Whitespace Tolerant** - Automatically trims whitespace

✅ **Zero Dependencies** - No external dependencies required

## Installation

### Bun
```bash
bun add @ooneex/http-mimes
```

### pnpm
```bash
pnpm add @ooneex/http-mimes
```

### Yarn
```bash
yarn add @ooneex/http-mimes
```

### npm
```bash
npm install @ooneex/http-mimes
```

## Usage

### Basic Usage

```typescript
import { Mime } from '@ooneex/http-mimes';

const mime = new Mime();

// Check if a MIME type is JSON
console.log(mime.isJson('application/json')); // true
console.log(mime.isJson('application/hal+json')); // true

// Check if a MIME type is an image
console.log(mime.isImage('image/png')); // true
console.log(mime.isImage('image/jpeg')); // true

// Check if a MIME type is audio
console.log(mime.isAudio('audio/mpeg')); // true
console.log(mime.isAudio('audio/wav')); // true
```

### Advanced Usage

```typescript
import { Mime, MimeType } from '@ooneex/http-mimes';

const mime = new Mime();

// Handle different case variations
console.log(mime.isJson('APPLICATION/JSON')); // true
console.log(mime.isVideo('VIDEO/MP4')); // true

// Handle whitespace
console.log(mime.isPdf(' application/pdf ')); // true

// Check multiple formats
const contentTypes = [
  'application/json',
  'image/png',
  'video/mp4',
  'audio/mpeg'
];

contentTypes.forEach(type => {
  console.log(`${type}:`);
  console.log(`  Is JSON: ${mime.isJson(type)}`);
  console.log(`  Is Image: ${mime.isImage(type)}`);
  console.log(`  Is Video: ${mime.isVideo(type)}`);
  console.log(`  Is Audio: ${mime.isAudio(type)}`);
});
```

## API Reference

### `Mime` Class

The main class providing MIME type detection methods.

#### Methods

##### `isJson(mimeType: string): boolean`
Checks if a MIME type is JSON-related.

**Parameters:**
- `mimeType` - The MIME type to check

**Returns:** `true` if JSON-related, `false` otherwise

**Example:**
```typescript
mime.isJson('application/json'); // true
mime.isJson('application/hal+json'); // true
mime.isJson('text/html'); // false
```

##### `isAudio(mimeType: string): boolean`
Checks if a MIME type is audio-related.

**Example:**
```typescript
mime.isAudio('audio/mpeg'); // true
mime.isAudio('audio/wav'); // true
mime.isAudio('video/mp4'); // false
```

##### `isVideo(mimeType: string): boolean`
Checks if a MIME type is video-related.

**Example:**
```typescript
mime.isVideo('video/mp4'); // true
mime.isVideo('video/webm'); // true
mime.isVideo('audio/mpeg'); // false
```

##### `isImage(mimeType: string): boolean`
Checks if a MIME type is image-related.

**Example:**
```typescript
mime.isImage('image/png'); // true
mime.isImage('image/jpeg'); // true
mime.isImage('text/html'); // false
```

##### `isPdf(mimeType: string): boolean`
Checks if a MIME type is PDF.

**Example:**
```typescript
mime.isPdf('application/pdf'); // true
mime.isPdf('text/html'); // false
```

##### `isHtml(mimeType: string): boolean`
Checks if a MIME type is HTML.

**Example:**
```typescript
mime.isHtml('text/html'); // true
mime.isHtml('application/xhtml+xml'); // true
```

##### `isCss(mimeType: string): boolean`
Checks if a MIME type is CSS.

**Example:**
```typescript
mime.isCss('text/css'); // true
```

##### `isJavaScript(mimeType: string): boolean`
Checks if a MIME type is JavaScript.

**Example:**
```typescript
mime.isJavaScript('application/javascript'); // true
mime.isJavaScript('text/javascript'); // true
```

##### `isXml(mimeType: string): boolean`
Checks if a MIME type is XML-related.

**Example:**
```typescript
mime.isXml('application/xml'); // true
mime.isXml('text/xml'); // true
```

##### `isText(mimeType: string): boolean`
Checks if a MIME type is text-related.

**Example:**
```typescript
mime.isText('text/plain'); // true
mime.isText('text/html'); // true
```

##### `isFont(mimeType: string): boolean`
Checks if a MIME type is font-related.

**Example:**
```typescript
mime.isFont('font/woff'); // true
mime.isFont('font/woff2'); // true
```

##### `isZip(mimeType: string): boolean`
Checks if a MIME type is ZIP-related.

**Example:**
```typescript
mime.isZip('application/zip'); // true
```

##### Additional Format Methods

- `isMp4(mimeType: string): boolean` - Checks for MP4 video
- `isMp3(mimeType: string): boolean` - Checks for MP3 audio
- `isSvg(mimeType: string): boolean` - Checks for SVG images
- `isJpeg(mimeType: string): boolean` - Checks for JPEG images
- `isJpg(mimeType: string): boolean` - Alias for JPEG
- `isPng(mimeType: string): boolean` - Checks for PNG images
- `isGif(mimeType: string): boolean` - Checks for GIF images
- `isWebp(mimeType: string): boolean` - Checks for WebP images
- `isCsv(mimeType: string): boolean` - Checks for CSV files
- `isOctetStream(mimeType: string): boolean` - Checks for binary streams
- `isWord(mimeType: string): boolean` - Checks for Microsoft Word documents
- `isExcel(mimeType: string): boolean` - Checks for Microsoft Excel documents
- `isPowerPoint(mimeType: string): boolean` - Checks for Microsoft PowerPoint documents


#### `MimeType`
TypeScript type representing all valid MIME types.

**Example:**
```typescript
import { MimeType } from '@ooneex/http-mimes';

const contentType: MimeType = 'application/json'; // Type-safe
```

### Interface

#### `IMime`
Interface defining all available MIME type detection methods.

**Example:**
```typescript
import { IMime } from '@ooneex/http-mimes';

class CustomMime implements IMime {
  // Implement all required methods
  isJson(mimeType: string): boolean {
    // Custom implementation
    return mimeType === 'application/json';
  }
  // ... other methods
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
