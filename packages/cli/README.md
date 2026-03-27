# @ooneex/cli

Interactive CLI toolkit for scaffolding Ooneex projects, modules, controllers, services, repositories, and more with customizable code generation templates.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Application Scaffolding** - Generate complete Ooneex applications with best practices

✅ **Module Generation** - Create feature modules with controllers, entities, and services

✅ **Controller Generation** - Generate HTTP and WebSocket controllers with route definitions

✅ **Service Generation** - Create service classes with dependency injection

✅ **Entity & Repository Generation** - Generate entities and repository classes

✅ **Middleware Generation** - Scaffold HTTP and WebSocket middleware classes

✅ **Interactive Prompts** - User-friendly prompts with input validation constraints

✅ **Docker Support** - Generate Docker configuration files

✅ **Migration & Seeds** - Create database migrations and seed files

✅ **AI & Vector Database** - Generate AI service integrations and vector database configurations

✅ **Claude Skill Generation** - Scaffold Claude AI skill templates

✅ **Comprehensive Templates** - 20+ code generation commands covering cron, logger, mailer, storage, analytics, cache, permissions, pub/sub, and more

## Installation

### Bun (Global)
```bash
bun add -g @ooneex/cli
```

### Bun (Local)
```bash
bun add -D @ooneex/cli
```

## Usage

### Creating a New Application

```bash
ooneex make:app
```

This command will interactively prompt you for:
- Application name
- Destination path

The generated application includes:
- Configured `package.json` with all necessary dependencies
- TypeScript configuration
- Biome linting setup
- Nx workspace configuration
- Git configuration with `.gitignore`
- Initial app module

### Generating a Module

```bash
ooneex make:module
```

Creates a new feature module with:
- Module structure
- Controllers directory
- Services directory
- Entities directory
- Repository files
- Test scaffolding

### Generating a Controller

```bash
ooneex make:controller
```

Interactive prompts will ask for:
- Controller name
- Socket or HTTP controller
- Route namespace (api, admin, public, etc.)
- Resource name
- Route action
- Route path
- HTTP method (for HTTP controllers)

**Example output:**
```
✔ src/controllers/UserListController.ts created successfully
✔ src/types/routes/api.users.list.ts created successfully
✔ tests/controllers/UserListController.spec.ts created successfully
```

### Generating a Service

```bash
ooneex make:service
```

Creates a service class with:
- Dependency injection decorator
- Interface implementation
- Test file

### Generating an Entity

```bash
ooneex make:entity
```

Creates a TypeORM entity with:
- Base entity fields (id, timestamps)
- Primary column configuration
- Repository integration

### Generating CRUD Operations

```bash
ooneex make:crud
```

Scaffolds complete CRUD operations including:
- List controller
- Show controller
- Create controller
- Update controller
- Delete controller
- Associated route types
- Test files

### Additional Commands

| Command | Description |
|---------|-------------|
| `make:ai` | Generate AI service integration |
| `make:analytics` | Generate analytics service |
| `make:cache` | Generate cache service |
| `make:cron` | Generate cron job class |
| `make:database` | Generate database configuration |
| `make:docker` | Generate Docker files |
| `make:logger` | Generate logger service |
| `make:mailer` | Generate mailer service |
| `make:middleware` | Generate middleware class |
| `make:migration` | Generate database migration |
| `make:permission` | Generate permission class |
| `make:pubsub` | Generate pub/sub handler |
| `make:repository` | Generate repository class |
| `make:seed` | Generate database seeder |
| `make:storage` | Generate storage service |
| `make:vector-database` | Generate vector database configuration |
| `make:claude-skill` | Generate Claude AI skill template |

## API Reference

### Interfaces

#### `ICommand<Options>`

Interface for creating custom CLI commands.

```typescript
interface ICommand<Options extends Record<string, unknown> = Record<string, unknown>> {
  run: (options: Options) => Promise<void> | void;
  getName: () => string;
  getDescription: () => string;
}
```

### Types

#### `CommandClassType`

```typescript
type CommandClassType = new (...args: any[]) => ICommand;
```

### Decorators

#### `@decorator.command()`

Decorator to register a command with the CLI container.

```typescript
import { decorator } from '@ooneex/cli';
import type { ICommand } from '@ooneex/cli';

@decorator.command()
class MyCustomCommand implements ICommand {
  public getName(): string {
    return 'my:command';
  }

  public getDescription(): string {
    return 'My custom command description';
  }

  public async run(options: Record<string, unknown>): Promise<void> {
    // Command implementation
  }
}
```

## Advanced Usage

### Creating Custom Commands

```typescript
import { decorator } from '@ooneex/cli';
import type { ICommand } from '@ooneex/cli';
import { TerminalLogger } from '@ooneex/logger';

type MyCommandOptions = {
  name?: string;
  verbose?: boolean;
};

@decorator.command()
class MyCustomCommand implements ICommand<MyCommandOptions> {
  private readonly logger = new TerminalLogger();

  public getName(): string {
    return 'custom:generate';
  }

  public getDescription(): string {
    return 'Generate custom files for the project';
  }

  public async run(options: MyCommandOptions): Promise<void> {
    const { name, verbose } = options;

    if (verbose) {
      this.logger.info('Running in verbose mode');
    }

    // Custom generation logic
    await Bun.write('output.ts', 'export const example = true;');

    this.logger.success('File generated successfully', undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
```

### Using with Arguments

```bash
ooneex make:controller --name UserList
```

### Programmatic Usage

```typescript
import { getCommand } from '@ooneex/cli';

const command = getCommand('make:controller');

if (command) {
  await command.run({
    name: 'UserList',
    isSocket: false,
    route: {
      name: 'api.users.list',
      path: '/api/users',
      method: 'GET'
    }
  });
}
```

### Generated Application Structure

When running `make:app`, the following structure is created:

```
my-app/
├── modules/
│   └── app/
│       ├── src/
│       │   ├── controllers/
│       │   ├── entities/
│       │   ├── services/
│       │   └── index.ts
│       ├── tests/
│       └── package.json
├── .commitlintrc.ts
├── .gitignore
├── biome.jsonc
├── bunfig.toml
├── nx.json
├── package.json
└── tsconfig.json
```

### Generated Module Structure

```
modules/
└── user/
    ├── src/
    │   ├── controllers/
    │   ├── entities/
    │   │   └── UserEntity.ts
    │   ├── services/
    │   │   └── UserService.ts
    │   ├── types/
    │   │   └── routes/
    │   └── index.ts
    ├── tests/
    │   ├── controllers/
    │   ├── entities/
    │   └── services/
    ├── package.json
    └── bunup.config.ts
```

## Error Handling

The CLI provides informative error messages when something goes wrong:

```typescript
import { CommandException } from '@ooneex/cli';

// Errors are automatically caught and displayed
// with proper formatting via TerminalLogger
```

## Environment

The CLI respects the following environment variables:

| Variable | Description |
|----------|-------------|
| `CWD` | Custom working directory for file generation |

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
