import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251229125419738 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS medecine_fields (
        id VARCHAR(25) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        color VARCHAR(20),
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
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_code ON medecine_fields(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_name ON medecine_fields(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_language ON medecine_fields(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_deleted_at ON medecine_fields(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_is_public ON medecine_fields(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_is_public_language ON medecine_fields(is_public, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_blocked ON medecine_fields(is_blocked, blocked_at) WHERE is_blocked = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_updated_at ON medecine_fields(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_created_at ON medecine_fields(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_medecine_fields_active ON medecine_fields(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS medecine_fields CASCADE`;
  }

  public getVersion(): string {
    return "20251229125419738";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
