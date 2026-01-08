import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225182218195 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS payment_credits (
        id VARCHAR(25) PRIMARY KEY,
        balance DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3),
        expires_at TIMESTAMPTZ,
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
      CREATE INDEX IF NOT EXISTS idx_payment_credits_balance ON payment_credits(balance)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_currency ON payment_credits(currency)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_expires_at ON payment_credits(expires_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_language ON payment_credits(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_deleted_at ON payment_credits(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_is_public ON payment_credits(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_created_at ON payment_credits(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_active ON payment_credits(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_credits_valid ON payment_credits(expires_at) WHERE deleted_at IS NULL AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_credits CASCADE`;
  }

  public getVersion(): string {
    return "20251225182218195";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
