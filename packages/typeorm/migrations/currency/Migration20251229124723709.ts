import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251229124723709 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS currencies (
        id VARCHAR(25) PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(20),
        symbol VARCHAR(20) NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_name ON currencies(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_symbol ON currencies(symbol)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_language ON currencies(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_deleted_at ON currencies(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_is_public ON currencies(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_is_public_language ON currencies(is_public, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_blocked ON currencies(is_blocked, blocked_at) WHERE is_blocked = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_updated_at ON currencies(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_created_at ON currencies(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS currencies CASCADE`;
  }

  public getVersion(): string {
    return "20251229124723709";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
