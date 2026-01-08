import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225182218185 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS payment_features (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT true,
        "limit" INT,
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
      CREATE INDEX IF NOT EXISTS idx_payment_features_name ON payment_features(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_features_is_enabled ON payment_features(is_enabled)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_features_language ON payment_features(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_features_deleted_at ON payment_features(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_features_is_public ON payment_features(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_features_created_at ON payment_features(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_features_active ON payment_features(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_features CASCADE`;
  }

  public getVersion(): string {
    return "20251225182218185";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
