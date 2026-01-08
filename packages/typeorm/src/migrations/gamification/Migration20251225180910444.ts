import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225180910444 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS levels (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_levels_name ON levels(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_levels_code ON levels(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_levels_language ON levels(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_levels_deleted_at ON levels(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_levels_is_public ON levels(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_levels_created_at ON levels(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_levels_active ON levels(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS levels CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910444";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
