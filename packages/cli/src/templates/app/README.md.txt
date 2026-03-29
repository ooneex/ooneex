# {{NAME}}

A modular, enterprise-grade backend framework built with TypeScript and Bun, powered by the **@ooneex** ecosystem.

## Prerequisites

- [Bun](https://bun.sh) (latest)
- [Docker](https://www.docker.com/) & Docker Compose

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp modules/app/.env.example modules/app/.env
```

Edit `modules/app/.env` with your configuration values.

### 3. Run migrations and seeds

```bash
bun run migration:up
bun run seed:run
```

### 4. Start the development server

```bash
bun run dev
```

The server starts on `http://localhost:3000` by default.

## Commands

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `bun run dev`          | Start dev server with Docker         |
| `bun run build`        | Build for production                 |
| `bun run test`         | Run all tests                        |
| `bun run lint`         | Run TypeScript check + Biome linting |
| `bun run fmt`          | Format code with Biome               |
| `bun run migration:up` | Execute pending database migrations  |
| `bun run seed:run`     | Populate database with seed data     |
| `bun run docker:stop`  | Stop all Docker containers           |
| `bun run commit`       | Interactive conventional commit      |

## Module Architecture

Each module under `modules/` follows a consistent structure and registers its components via a Module class:

```typescript
@decorator.module({
  controllers: [],   // HTTP / WebSocket route handlers
  entities: [],      // TypeORM database entities
  permissions: [],   // Role-based access control
  middlewares: [],   // HTTP middleware pipeline
  cronJobs: [],      // Scheduled tasks
  events: [],        // Pub/Sub event handlers
})
class AppModule {}
```

## Docker

### Production build

```bash
docker build -t {{NAME}} --build-arg DATABASE_URL=<url> modules/app
docker run -p 3000:3000 {{NAME}}
```

## Code Quality

- **Formatter/Linter:** Biome (double quotes, 2-space indent, 120 char line width)
- **Commit conventions:** Conventional Commits enforced via Commitlint + Husky
- **Pre-commit hooks:** Biome check + TypeScript type check on staged files

## License

Proprietary - All rights reserved.
