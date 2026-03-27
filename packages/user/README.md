# @ooneex/user

User identity types and interfaces defining profiles, authentication credentials, roles, and account metadata for user management systems.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **User Interface** - `IUser` with email, roles, profile fields, two-factor auth, and session/account references

✅ **Session Management** - `ISession` interface with token, refresh token, device info, location, and expiration tracking

✅ **Multi-Provider Accounts** - `IAccount` interface supporting OAuth, email, credentials, and WebAuthn authentication types

✅ **Verification System** - `IVerification` interface for email, phone, password reset, two-factor, and account activation flows

✅ **Profile Update Auditing** - `IUserProfileUpdate` interface tracking field changes, previous/new values, and approval status

✅ **Account Type Enums** - `EAccountType`, `EVerificationType`, and `EProfileUpdateStatus` enums with string literal types

✅ **Zero Runtime** - Pure type definitions and enums with no runtime overhead

## Installation

### Bun
```bash
bun add @ooneex/user
```

### pnpm
```bash
pnpm add @ooneex/user
```

### Yarn
```bash
yarn add @ooneex/user
```

### npm
```bash
npm install @ooneex/user
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
