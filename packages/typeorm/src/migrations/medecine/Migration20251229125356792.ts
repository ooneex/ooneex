import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251229125356792 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS medecine_disciplines (
        id VARCHAR(25) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
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
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_code ON medecine_disciplines(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_name ON medecine_disciplines(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_language ON medecine_disciplines(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_deleted_at ON medecine_disciplines(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_is_public ON medecine_disciplines(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_is_public_language ON medecine_disciplines(is_public, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_blocked ON medecine_disciplines(is_blocked, blocked_at) WHERE is_blocked = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_updated_at ON medecine_disciplines(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_created_at ON medecine_disciplines(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_disciplines_active ON medecine_disciplines(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS medecine_disciplines CASCADE`;
  }

  public getVersion(): string {
    return "20251229125356792";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
