import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225173354646 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS book_publishers (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        address TEXT,
        website VARCHAR(255),
        founded_year INT,
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
      CREATE INDEX IF NOT EXISTS idx_book_publishers_name ON book_publishers(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_founded_year ON book_publishers(founded_year)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_language ON book_publishers(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_deleted_at ON book_publishers(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_is_public ON book_publishers(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_name_lower ON book_publishers(LOWER(name)) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_created_at ON book_publishers(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_book_publishers_active ON book_publishers(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS book_publishers CASCADE`;
  }

  public getVersion(): string {
    return "20251225173354646";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
