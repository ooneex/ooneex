# @ooneex/database

A comprehensive TypeScript/JavaScript database library designed for Bun runtime. This package provides a unified interface for database operations with support for SQLite, PostgreSQL, and MySQL, along with TypeORM adapters for advanced ORM functionality.

![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Multi-Database Support** - SQLite, PostgreSQL, and MySQL support

✅ **Bun Native** - Built specifically for Bun runtime with Bun.SQL

✅ **TypeORM Integration** - Dedicated adapters for PostgreSQL and SQLite

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Connection Management** - Robust connection opening, closing, and lifecycle management

✅ **Database Operations** - Create, drop, and manage database instances

✅ **Error Handling** - Comprehensive error handling with custom exceptions

✅ **Environment Support** - Automatic environment variable detection

✅ **Zero Configuration** - Works out of the box with sensible defaults

## Installation

### Bun
```bash
bun add @ooneex/database
```

## Usage

### TypeORM PostgreSQL Adapter

```typescript
import { TypeormPgDatabaseAdapter } from '@ooneex/database';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}

const adapter = new TypeormPgDatabaseAdapter({
  url: 'postgresql://user:pass@localhost:5432/mydb',
  synchronize: true,
  entities: [User]
});

// Open and get repository
const userRepository = await adapter.open(User);

// Create user
const user = userRepository.create({
  name: 'John Doe',
  email: 'john@example.com'
});
await userRepository.save(user);

// Find users
const users = await userRepository.find();

// Close connection
await adapter.close();
```

### TypeORM SQLite Adapter

```typescript
import { TypeormSqliteDatabaseAdapter } from '@ooneex/database';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;
}

const adapter = new TypeormSqliteDatabaseAdapter({
  database: './products.db',
  synchronize: true,
  entities: [Product]
});

// Open and get repository
const productRepository = await adapter.open(Product);

// Create product
const product = productRepository.create({
  name: 'Laptop',
  price: 999.99
});
await productRepository.save(product);

// Close connection
await adapter.close();
```

### Error Handling

```typescript
import { Database, DatabaseException } from '@ooneex/database';

try {
  const db = new Database('invalid://connection');
  await db.open();
} catch (error) {
  if (error instanceof DatabaseException) {
    console.error('Database error:', error.message);
    console.error('Error data:', error.data);
  }
}
```

### Environment Configuration

```bash
# Set in your .env file
DATABASE_URL=sqlite://./myapp.db
# or
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
# or
DATABASE_URL=mysql://user:password@localhost:3306/mydb

# For SQLite adapter
SQLITE_DATABASE_PATH=./myapp.db
```

## API Reference

### `Database` Class

The main database class providing connection management and basic operations.

#### Constructor

```typescript
constructor(connectionString?: string | URL, options?: Bun.SQL.Options)
```

**Parameters:**
- `connectionString` - Database connection string or URL object
- `options` - Bun.SQL connection options

**Example:**
```typescript
const db = new Database('sqlite://./app.db', { timeout: 5000 });
```

#### Methods

##### `getClient(): Bun.SQL`
Returns the underlying Bun.SQL client instance.

**Returns:** The Bun.SQL client

**Example:**
```typescript
const client = db.getClient();
const result = await client`SELECT * FROM users`;
```

##### `open(): Promise<void>`
Opens the database connection.

**Example:**
```typescript
await db.open();
```

##### `close(): Promise<void>`
Closes the database connection.

**Example:**
```typescript
await db.close();
```

##### `drop(): Promise<void>`
Drops the database. **Caution: This is destructive and cannot be undone.**

**Example:**
```typescript
await db.drop(); // Permanently deletes the database
```

### `TypeormPgDatabaseAdapter` Class

TypeORM adapter for PostgreSQL databases.

#### Constructor

```typescript
constructor(options: Omit<PostgresConnectionOptions, "type">)
```

**Parameters:**
- `options` - PostgreSQL connection options (without type field)

#### Methods

##### `getSource(): DataSource`
Returns the TypeORM DataSource instance.

##### `open<Entity>(entity: EntityTarget<Entity>): Promise<Repository<Entity>>`
Opens connection and returns repository for the specified entity.

##### `close(): Promise<void>`
Closes the database connection.

##### `drop(): Promise<void>`
Drops the database schema.

##### `getEntityManager(): EntityManager`
Returns the TypeORM EntityManager.

### `TypeormSqliteDatabaseAdapter` Class

TypeORM adapter for SQLite databases.

#### Constructor

```typescript
constructor(options: Omit<SqliteConnectionOptions, "type">)
```

**Parameters:**
- `options` - SQLite connection options (without type field)

#### Methods

Same methods as `TypeormPgDatabaseAdapter` but optimized for SQLite.

### `DatabaseException` Class

Custom exception class for database-related errors.

#### Constructor

```typescript
constructor(message: string, data?: T)
```

**Parameters:**
- `message` - Error message
- `data` - Additional error data

### Interfaces

#### `IDatabase`

```typescript
interface IDatabase {
  open(): Promise<void>;
  close(): Promise<void>;
  drop(): Promise<void>;
}
```

#### `ITypeormDatabaseAdapter`

```typescript
interface ITypeormDatabaseAdapter {
  open(entity: any): Promise<any>;
  close(): Promise<void>;
  drop(): Promise<void>;
}
```

## Supported Database URLs

### SQLite
```typescript
// File-based database
'sqlite://./database.db'
'sqlite:database.db'
'./database.db'

// In-memory database
'sqlite://:memory:'
':memory:'
```

### PostgreSQL
```typescript
'postgresql://user:password@localhost:5432/database'
'postgres://user:password@localhost:5432/database'
```

### MySQL
```typescript
'mysql://user:password@localhost:3306/database'
'mysql2://user:password@localhost:3306/database'
```

## Best Practices

### Connection Management
- Always call `close()` when done with database operations
- Use try-catch blocks for proper error handling
- Consider connection pooling for high-traffic applications

### Error Handling
- Catch `DatabaseException` specifically for database errors
- Log error details for debugging
- Implement retry logic for transient failures

### Security
- Never hardcode database credentials
- Use environment variables for sensitive information
- Validate input data before database operations

### Performance
- Use prepared statements when possible
- Implement proper indexing strategies
- Monitor query performance in production

## TypeORM Integration

This package provides specialized adapters for TypeORM, allowing you to leverage the full power of TypeORM while maintaining the simplicity of the Ooneex database interface.

### PostgreSQL with TypeORM

```typescript
import { TypeormPgDatabaseAdapter } from '@ooneex/database';

const adapter = new TypeormPgDatabaseAdapter({
  url: process.env.DATABASE_URL,
  synchronize: false, // Set to true only in development
  entities: [User, Product, Order],
  migrations: ['./migrations/**/*.ts'],
  extra: {
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000
  }
});
```

### SQLite with TypeORM

```typescript
import { TypeormSqliteDatabaseAdapter } from '@ooneex/database';

const adapter = new TypeormSqliteDatabaseAdapter({
  database: './myapp.db',
  synchronize: true,
  entities: [User, Product],
  enableWAL: true, // Write-Ahead Logging for better performance
  busyTimeout: 30000
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

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Test with different database types (SQLite, PostgreSQL, MySQL)

---

Made with ❤️ by the Ooneex team
