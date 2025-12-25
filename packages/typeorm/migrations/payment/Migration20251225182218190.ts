import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182218185 } from "./Migration20251225182218185";

@migration()
export class Migration20251225182218190 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE subscription_period AS ENUM ('monthly', 'yearly', 'weekly', 'daily')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_plans (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        currency VARCHAR(3) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        period subscription_period NOT NULL,
        period_count INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        trial_days INT DEFAULT 0,
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
      CREATE TABLE IF NOT EXISTS payment_plans_features (
        plan_id VARCHAR(25) NOT NULL,
        feature_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (plan_id, feature_id),
        CONSTRAINT fk_payment_plans_features_plan FOREIGN KEY (plan_id) REFERENCES payment_plans(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_plans_features_feature FOREIGN KEY (feature_id) REFERENCES payment_features(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_name ON payment_plans(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_currency ON payment_plans(currency)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_price ON payment_plans(price)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_period ON payment_plans(period)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_is_active ON payment_plans(is_active)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_language ON payment_plans(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_deleted_at ON payment_plans(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_is_public ON payment_plans(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_created_at ON payment_plans(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON payment_plans(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_active_plans ON payment_plans(is_active, price) WHERE deleted_at IS NULL AND is_active = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_features_plan_id ON payment_plans_features(plan_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_plans_features_feature_id ON payment_plans_features(feature_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_plans_features CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_plans CASCADE`;
    await tx`DROP TYPE IF EXISTS subscription_period CASCADE`;
  }

  public getVersion(): string {
    return "20251225182218190";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225182218185, // Payment features table
    ];
  }
}
