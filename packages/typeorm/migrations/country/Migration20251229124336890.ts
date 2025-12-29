import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251229124336890 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS countries (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
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
      CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_language ON countries(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_deleted_at ON countries(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_is_public ON countries(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_is_public_language ON countries(is_public, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_blocked ON countries(is_blocked, blocked_at) WHERE is_blocked = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_updated_at ON countries(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_created_at ON countries(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS countries CASCADE`;
  }

  public getVersion(): string {
    return "20251229124336890";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
