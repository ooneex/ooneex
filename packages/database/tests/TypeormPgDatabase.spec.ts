import { describe, expect, test } from "bun:test";
import { DataSource } from "typeorm";
import { TypeormPgDatabase } from "../src/TypeormPgDatabase";
import { DatabaseException } from "../src/DatabaseException";

describe("TypeormPgDatabase", () => {
  test("should return a DataSource instance with provided URL", () => {
    const db = new TypeormPgDatabase();
    const source = db.getSource("postgresql://localhost:5432/testdb");

    expect(source).toBeInstanceOf(DataSource);
  });

  test("should configure DataSource with postgres type", () => {
    const db = new TypeormPgDatabase();
    const source = db.getSource("postgresql://localhost:5432/testdb");

    expect(source.options.type).toBe("postgres");
  });

  test("should configure DataSource with synchronize disabled", () => {
    const db = new TypeormPgDatabase();
    const source = db.getSource("postgresql://localhost:5432/testdb");

    expect(source.options.synchronize).toBe(false);
  });

  test("should configure DataSource with provided URL", () => {
    const url = "postgresql://user:pass@host:5432/mydb";
    const db = new TypeormPgDatabase();
    const source = db.getSource(url);

    expect((source.options as { url: string }).url).toBe(url);
  });

  test("should configure DataSource with extra options", () => {
    const db = new TypeormPgDatabase();
    const source = db.getSource("postgresql://localhost:5432/testdb");

    expect((source.options as { extra: { max: number } }).extra.max).toBe(10);
  });

  test("should fall back to DATABASE_URL env variable when no URL provided", () => {
    const originalEnv = Bun.env.DATABASE_URL;
    Bun.env.DATABASE_URL = "postgresql://localhost:5432/envdb";

    try {
      const db = new TypeormPgDatabase();
      const source = db.getSource();

      expect(source).toBeInstanceOf(DataSource);
      expect((source.options as { url: string }).url).toBe("postgresql://localhost:5432/envdb");
    } finally {
      Bun.env.DATABASE_URL = originalEnv;
    }
  });

  test("should throw DatabaseException when no URL provided and DATABASE_URL not set", () => {
    const originalEnv = Bun.env.DATABASE_URL;
    Bun.env.DATABASE_URL = undefined;

    try {
      const db = new TypeormPgDatabase();

      expect(() => db.getSource()).toThrow(DatabaseException);
      expect(() => db.getSource()).toThrow(
        "Database URL is required. Please provide a URL either through the constructor options or set the DATABASE_URL environment variable.",
      );
    } finally {
      Bun.env.DATABASE_URL = originalEnv;
    }
  });

  test("should store the source on the instance", () => {
    const db = new TypeormPgDatabase();
    const source = db.getSource("postgresql://localhost:5432/testdb");

    // Calling getSource again returns a new DataSource (not cached)
    const source2 = db.getSource("postgresql://localhost:5432/testdb2");
    expect(source2).toBeInstanceOf(DataSource);
    expect(source).not.toBe(source2);
  });

  test("should prefer explicit URL over DATABASE_URL env variable", () => {
    const originalEnv = Bun.env.DATABASE_URL;
    Bun.env.DATABASE_URL = "postgresql://localhost:5432/envdb";

    try {
      const db = new TypeormPgDatabase();
      const explicitUrl = "postgresql://localhost:5432/explicitdb";
      const source = db.getSource(explicitUrl);

      expect((source.options as { url: string }).url).toBe(explicitUrl);
    } finally {
      Bun.env.DATABASE_URL = originalEnv;
    }
  });
});
