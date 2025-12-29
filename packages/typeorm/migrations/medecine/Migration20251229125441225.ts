import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251229125441225 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS medecine_years (
        id VARCHAR(25) PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        number INT NOT NULL,
        color VARCHAR(20),
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
      CREATE INDEX IF NOT EXISTS idx_medecine_years_code ON medecine_years(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_name ON medecine_years(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_number ON medecine_years(number)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_language ON medecine_years(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_deleted_at ON medecine_years(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_is_public ON medecine_years(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_is_public_language ON medecine_years(is_public, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_blocked ON medecine_years(is_blocked, blocked_at) WHERE is_blocked = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_updated_at ON medecine_years(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_created_at ON medecine_years(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_years_active ON medecine_years(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS medecine_years CASCADE`;
  }

  public getVersion(): string {
    return "20251229125441225";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
