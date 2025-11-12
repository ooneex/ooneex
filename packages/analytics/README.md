# @ooneex/analytics

A comprehensive TypeScript/JavaScript analytics library with PostHog integration for tracking user events and behavior. This package provides a clean, type-safe interface for capturing analytics events with support for user properties, groups, and custom event data.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **PostHog Integration** - Seamless PostHog analytics integration

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Environment Configuration** - Flexible API key and host configuration

✅ **Event Tracking** - Track user events with custom properties and groups

✅ **User Properties** - Attach custom properties to user events

✅ **Group Analytics** - Support for group-based analytics tracking

✅ **Error Handling** - Comprehensive error handling with custom exceptions

✅ **Bun Runtime** - Optimized for Bun runtime environment

✅ **Zero Config** - Works out of the box with environment variables

## Installation

### Bun
```bash
bun add @ooneex/analytics
```

## Setup

### Environment Variables

Set the following environment variables in your project:

```bash
# Required: Your PostHog API key
ANALYTICS_POSTHOG_API_KEY=your_posthog_api_key_here

# Optional: PostHog host (defaults to https://eu.i.posthog.com)
ANALYTICS_POSTHOG_HOST=https://eu.i.posthog.com
```

### Configuration Options

You can also configure the analytics adapter programmatically:

```typescript
import { PostHogAdapter } from '@ooneex/analytics';

// Using constructor options (overrides environment variables)
const analytics = new PostHogAdapter({
  apiKey: 'your_api_key',
  host: 'https://your-posthog-instance.com'
});

// Using environment variables only
const analytics = new PostHogAdapter();
```

## Usage

### Basic Event Tracking

```typescript
import { PostHogAdapter } from '@ooneex/analytics';

const analytics = new PostHogAdapter();

// Track a simple event
analytics.capture({
  id: 'user_123',
  event: 'button_clicked',
  properties: {
    buttonId: 'signup-btn',
    page: '/landing'
  }
});
```

### Advanced Event Tracking with Groups

```typescript
import { PostHogAdapter } from '@ooneex/analytics';

const analytics = new PostHogAdapter();

// Track event with user properties and groups
analytics.capture({
  id: 'user_123',
  event: 'feature_used',
  properties: {
    feature: 'advanced_search',
    sessionDuration: 1200,
    actionsCount: 15,
    source: 'web_app'
  },
  groups: {
    company: 'acme_corp',
    plan: 'enterprise'
  }
});
```

### E-commerce Tracking

```typescript
// Track purchase events
analytics.capture({
  id: 'user_123',
  event: 'purchase_completed',
  properties: {
    orderId: 'order_456',
    revenue: 99.99,
    currency: 'USD',
    products: ['product_1', 'product_2'],
    paymentMethod: 'credit_card',
    discount: 10.00
  },
  groups: {
    store: 'online',
    region: 'us_west'
  }
});
```

### User Signup Tracking

```typescript
// Track user registration
analytics.capture({
  id: 'user_123',
  event: 'user_signup',
  properties: {
    email: 'user@example.com',
    source: 'google_ads',
    plan: 'free',
    referrer: 'https://example.com'
  },
  groups: {
    company: 'new_company'
  }
});
```

### Custom Implementation

```typescript
import { IAnalytics, PostHogAdapterCaptureType } from '@ooneex/analytics';

class CustomAnalytics implements IAnalytics {
  capture(options: PostHogAdapterCaptureType): void {
    // Custom analytics implementation
    console.log('Tracking event:', options.event, 'for user:', options.id);

    // You can extend or modify the tracking logic here
  }
}
```

## API Reference

### `PostHogAdapter` Class

The main analytics adapter class that implements PostHog integration.

#### Constructor

```typescript
new PostHogAdapter(options?: { apiKey?: string; host?: string })
```

**Parameters:**
- `options.apiKey` - PostHog API key (optional, can use `ANALYTICS_POSTHOG_API_KEY` env var)
- `options.host` - PostHog host URL (optional, defaults to `https://eu.i.posthog.com`)

**Throws:** `AnalyticsException` if no API key is provided

**Example:**
```typescript
// Using environment variables
const analytics = new PostHogAdapter();

// Using constructor options
const analytics = new PostHogAdapter({
  apiKey: 'phc_your_key_here',
  host: 'https://app.posthog.com'
});
```

#### Methods

##### `capture(options: PostHogAdapterCaptureType): void`

Captures an analytics event with user properties and groups.

**Parameters:**
- `options.id` - Unique user identifier (required)
- `options.event` - Event name (required)
- `options.properties` - Custom event properties (optional)
- `options.groups` - Group associations (optional)

**Example:**
```typescript
analytics.capture({
  id: 'user_123',
  event: 'page_viewed',
  properties: {
    page: '/dashboard',
    loadTime: 1.2,
    userAgent: 'Chrome/91.0'
  },
  groups: {
    company: 'acme_corp',
    team: 'marketing'
  }
});
```

### Types

#### `IAnalytics`

Interface defining the analytics contract.

```typescript
interface IAnalytics {
  capture: (options: PostHogAdapterCaptureType) => void;
}
```

#### `PostHogAdapterCaptureType`

Type definition for capture event data.

```typescript
type PostHogAdapterCaptureType = {
  id: string;                              // User identifier
  event: string;                           // Event name
  properties?: Record<string, unknown>;    // Custom properties
  groups?: Record<string, string | number>; // Group associations
};
```

### Error Handling

#### `AnalyticsException`

Custom exception class for analytics-related errors.

```typescript
import { AnalyticsException } from '@ooneex/analytics';

try {
  const analytics = new PostHogAdapter(); // Missing API key
} catch (error) {
  if (error instanceof AnalyticsException) {
    console.error('Analytics Error:', error.message);
    // Handle analytics-specific error
  }
}
```

**Common Error Scenarios:**
- Missing PostHog API key
- Invalid configuration options
- Network connectivity issues

## Environment Setup

### Required Environment Variables

```bash
# PostHog API Key (required)
ANALYTICS_POSTHOG_API_KEY=phc_your_api_key_here
```

### Optional Environment Variables

```bash
# PostHog Host (optional, defaults to EU instance)
ANALYTICS_POSTHOG_HOST=https://app.posthog.com

# For US instance
ANALYTICS_POSTHOG_HOST=https://us.i.posthog.com

# For self-hosted instance
ANALYTICS_POSTHOG_HOST=https://your-posthog-instance.com
```

## Best Practices

### Event Naming

Use consistent, descriptive event names:

```typescript
// ✅ Good
analytics.capture({
  id: 'user_123',
  event: 'button_clicked',
  properties: { button: 'signup' }
});

// ❌ Avoid
analytics.capture({
  id: 'user_123',
  event: 'click',
  properties: { what: 'something' }
});
```

### Property Structure

Keep properties flat and meaningful:

```typescript
// ✅ Good
analytics.capture({
  id: 'user_123',
  event: 'purchase_completed',
  properties: {
    orderId: 'order_456',
    revenue: 99.99,
    currency: 'USD',
    itemCount: 3
  }
});

// ❌ Avoid deeply nested objects
analytics.capture({
  id: 'user_123',
  event: 'purchase_completed',
  properties: {
    order: {
      details: {
        nested: {
          data: 'value'
        }
      }
    }
  }
});
```

### Error Handling

Always handle potential configuration errors:

```typescript
import { PostHogAdapter, AnalyticsException } from '@ooneex/analytics';

try {
  const analytics = new PostHogAdapter();

  analytics.capture({
    id: 'user_123',
    event: 'app_started'
  });
} catch (error) {
  if (error instanceof AnalyticsException) {
    console.error('Analytics configuration error:', error.message);
    // Fallback analytics or silent failure
  }
}
```

## Runtime Support

This package is optimized for **Bun runtime only**. It leverages Bun-specific features and environment variable access patterns.

### Bun Environment

```typescript
// Automatic environment variable access
const analytics = new PostHogAdapter(); // Uses Bun.env.ANALYTICS_POSTHOG_API_KEY
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

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
- Test with Bun runtime environment

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

---

Made with ❤️ by the Ooneex team
