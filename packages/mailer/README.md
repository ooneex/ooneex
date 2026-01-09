# @ooneex/mailer

An email sending service for TypeScript applications with support for Nodemailer SMTP and Resend API. This package provides a unified interface for sending transactional emails with React-based email templates and seamless integration with the Ooneex framework.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Multiple Providers** - Support for Nodemailer SMTP and Resend API

✅ **React Templates** - Build email templates using React components

✅ **Layout System** - Pre-built email layout with header, body, and footer

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Container Integration** - Works seamlessly with dependency injection

✅ **Error Handling** - Comprehensive error handling with custom exceptions

## Installation

### Bun
```bash
bun add @ooneex/mailer
```

### pnpm
```bash
pnpm add @ooneex/mailer
```

### Yarn
```bash
yarn add @ooneex/mailer
```

### npm
```bash
npm install @ooneex/mailer
```

## Usage

### Basic Usage with Resend

```typescript
import { ResendMailerAdapter } from '@ooneex/mailer';

const mailer = new ResendMailerAdapter({
  apiKey: 'your-resend-api-key'
});

await mailer.send({
  to: ['user@example.com'],
  subject: 'Welcome to our platform!',
  content: <WelcomeEmail userName="John" />
});
```

### Using Nodemailer SMTP

```typescript
import { NodeMailerAdapter } from '@ooneex/mailer';

const mailer = new NodeMailerAdapter({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-username',
    pass: 'your-password'
  }
});

await mailer.send({
  to: ['user@example.com'],
  subject: 'Hello from Nodemailer!',
  content: <SimpleEmail message="Hello World" />
});
```

### With Environment Variables

```typescript
import { ResendMailerAdapter } from '@ooneex/mailer';

// Automatically uses MAILER_RESEND_API_KEY environment variable
const mailer = new ResendMailerAdapter();

await mailer.send({
  to: ['user@example.com'],
  subject: 'Test Email',
  content: <TestEmail />
});
```

**Environment Variables:**
- `MAILER_RESEND_API_KEY` - Resend API key
- `MAILER_SMTP_HOST` - SMTP server host
- `MAILER_SMTP_PORT` - SMTP server port
- `MAILER_SMTP_USER` - SMTP username
- `MAILER_SMTP_PASS` - SMTP password

### Using the Email Layout

```typescript
import { MailerLayout } from '@ooneex/mailer';

function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <MailerLayout
      title="Welcome"
      previewText="Welcome to our platform!"
    >
      <h1>Hello, {userName}!</h1>
      <p>Thank you for joining us.</p>
      <a href="https://example.com/dashboard">Get Started</a>
    </MailerLayout>
  );
}
```

### Custom Sender Information

```typescript
import { ResendMailerAdapter } from '@ooneex/mailer';

const mailer = new ResendMailerAdapter();

await mailer.send({
  to: ['user@example.com'],
  subject: 'Important Update',
  content: <UpdateEmail />,
  from: {
    name: 'Support Team',
    address: 'support@example.com'
  }
});
```

## API Reference

### Classes

#### `ResendMailerAdapter`

Email adapter using the Resend API for sending emails.

**Constructor:**
```typescript
new ResendMailerAdapter(options?: { apiKey?: string })
```

**Parameters:**
- `options.apiKey` - Resend API key (optional if set via environment variable)

**Methods:**

##### `send(config: SendConfig): Promise<void>`

Sends an email using the Resend API.

**Parameters:**
- `config.to` - Array of recipient email addresses
- `config.subject` - Email subject line
- `config.content` - React node to render as email body
- `config.from` - Optional sender information

**Example:**
```typescript
const mailer = new ResendMailerAdapter();

await mailer.send({
  to: ['recipient@example.com'],
  subject: 'Welcome!',
  content: <WelcomeEmail />
});
```

---

#### `NodeMailerAdapter`

Email adapter using Nodemailer for SMTP-based email sending.

**Constructor:**
```typescript
new NodeMailerAdapter(options?: NodeMailerOptionsType)
```

**Parameters:**
- `options.host` - SMTP server hostname
- `options.port` - SMTP server port
- `options.secure` - Use TLS (default: false for port 587)
- `options.auth.user` - SMTP username
- `options.auth.pass` - SMTP password

**Methods:**

##### `send(config: SendConfig): Promise<void>`

Sends an email using SMTP.

**Parameters:**
Same as `ResendMailerAdapter.send()`

---

#### `MailerLayout`

React component providing a pre-styled email layout.

**Props:**
- `title` - Email title (for document head)
- `previewText` - Preview text shown in email clients
- `children` - Email content

**Example:**
```typescript
<MailerLayout 
  title="Order Confirmation" 
  previewText="Your order has been confirmed"
>
  <h1>Thank you for your order!</h1>
  <p>Order #12345 has been confirmed.</p>
</MailerLayout>
```

### Interfaces

#### `IMailer`

```typescript
interface IMailer {
  send: (config: {
    to: string[];
    subject: string;
    content: React.ReactNode;
    from?: { name: string; address: string };
  }) => Promise<void>;
}
```

### Types

#### `MailerClassType`

```typescript
type MailerClassType = new (...args: any[]) => IMailer;
```

## Advanced Usage

### Integration with Ooneex App

```typescript
import { App } from '@ooneex/app';
import { ResendMailerAdapter } from '@ooneex/mailer';

const app = new App({
  mailer: ResendMailerAdapter,
  // ... other config
});

await app.run();
```

### Using in Controllers

```typescript
import { Route } from '@ooneex/routing';
import type { IController, ContextType } from '@ooneex/controller';

@Route.http({
  name: 'api.users.invite',
  path: '/api/users/invite',
  method: 'POST',
  description: 'Send invitation email'
})
class InviteUserController implements IController {
  public async index(context: ContextType): Promise<IResponse> {
    const { email, name } = context.payload;
    
    await context.mailer?.send({
      to: [email],
      subject: 'You are invited!',
      content: <InvitationEmail recipientName={name} />
    });
    
    return context.response.json({ sent: true });
  }
}
```

### Container Registration with Decorator

```typescript
import { container } from '@ooneex/container';
import { ResendMailerAdapter, decorator } from '@ooneex/mailer';

// Register with container using decorator
@decorator.mailer()
class MyMailerService extends ResendMailerAdapter {
  // Custom implementation
}

// Resolve from container
const mailer = container.get(MyMailerService);
```

### Error Handling

```typescript
import { ResendMailerAdapter, MailerException } from '@ooneex/mailer';

const mailer = new ResendMailerAdapter();

try {
  await mailer.send({
    to: ['user@example.com'],
    subject: 'Test',
    content: <TestEmail />
  });
} catch (error) {
  if (error instanceof MailerException) {
    console.error('Mailer Error:', error.message);
    // Handle email-specific error
  }
}
```

### Building Custom Email Templates

```typescript
import { MailerLayout } from '@ooneex/mailer';

interface OrderConfirmationProps {
  orderId: string;
  items: Array<{ name: string; price: number }>;
  total: number;
}

function OrderConfirmationEmail({ orderId, items, total }: OrderConfirmationProps) {
  return (
    <MailerLayout
      title="Order Confirmation"
      previewText={`Order #${orderId} confirmed`}
    >
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#333' }}>Order Confirmed!</h1>
        <p>Order ID: <strong>{orderId}</strong></p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Item</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '8px' }}>{item.name}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>
                  ${item.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Total</td>
              <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>
                ${total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
        
        <p style={{ marginTop: '20px' }}>
          Thank you for your purchase!
        </p>
      </div>
    </MailerLayout>
  );
}
```

### Sending to Multiple Recipients

```typescript
import { ResendMailerAdapter } from '@ooneex/mailer';

const mailer = new ResendMailerAdapter();

await mailer.send({
  to: [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ],
  subject: 'Team Announcement',
  content: <AnnouncementEmail />
});
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

---

Made with ❤️ by the Ooneex team
