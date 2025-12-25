import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251225173353646 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS book_authors (
        id VARCHAR(25) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        full_name VARCHAR(200),
        bio TEXT,
        birth_date DATE,
        death_date DATE,
        nationality VARCHAR(100),
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMPTZ,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMPTZ,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_first_name ON book_authors(first_name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_last_name ON book_authors(last_name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_full_name ON book_authors(full_name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_nationality ON book_authors(nationality)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_language ON book_authors(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_deleted_at ON book_authors(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_is_public ON book_authors(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_full_name_lower ON book_authors(LOWER(full_name)) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_created_at ON book_authors(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_authors_active ON book_authors(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS book_authors CASCADE`;
  }

  public getVersion(): string {
    return "20251225173353646";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
