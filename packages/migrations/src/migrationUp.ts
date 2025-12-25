import { container } from "@ooneex/container";
import type { IException } from "@ooneex/exception";
import { TerminalLogger } from "@ooneex/logger";
import { SQL } from "bun";
import { createMigrationTable } from "./createMigrationTable";
import { getMigrations } from "./getMigrations";
import type { IMigration } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: trust me
const run = async (migration: IMigration, tx: any, sql: SQL): Promise<void> => {
  const dependencies = await migration.getDependencies();

  for (const dependency of dependencies) {
    const dep = container.get(dependency);
    await run(dep, tx, sql);
  }

  await migration.up(tx, sql);
};

export const migrationUp = async (config?: { databaseUrl?: string; tableName?: string }): Promise<void> => {
  const tableName = config?.tableName || "migrations";

  const sql = new SQL({
    url: config?.databaseUrl || Bun.env.DATABASE_URL,

    // Connection pool settings
    max: 20, // Maximum connections in pool
    idleTimeout: 30, // Close idle connections after 30s
    maxLifetime: 0, // Connection lifetime in seconds (0 = forever)
    connectionTimeout: 30, // Timeout when establishing new connections
  });

  const logger = new TerminalLogger();
  const migrations = getMigrations();

  if (migrations.length === 0) {
    logger.info("No migrations found\n");
    process.exit(0);
  }

  await createMigrationTable(sql, tableName);

  for (const migration of migrations) {
    const id = migration.getVersion();

    const entities = await sql`SELECT * FROM ${sql(tableName)} WHERE id = ${id}`;

    if (entities.length > 0) {
      continue;
    }

    const migrationName = id;

    try {
      await sql.begin(async (tx) => {
        await run(migration, tx, sql);
        await tx`INSERT INTO ${sql(tableName)} (id) VALUES (${id})`;
        logger.success(`Migration ${migrationName} completed\n`);
      });
    } catch (error: unknown) {
      logger.error(`Migration ${migrationName} failed\n`);
      logger.error(error as IException);
      process.exit(1);
    }
  }
};
