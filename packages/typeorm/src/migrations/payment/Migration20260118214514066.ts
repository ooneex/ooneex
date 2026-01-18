import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182218188 } from "./Migration20251225182218188";
import { Migration20251225182218190 } from "./Migration20251225182218190";

@decorator.migration()
export class Migration20260118214514066 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE payment_discount_type AS ENUM ('percentage', 'fixed')
    `;

    await tx`
      CREATE TYPE payment_discount_duration AS ENUM ('once', 'repeating', 'forever')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_discounts (
        id VARCHAR(25) PRIMARY KEY,
        key VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        code VARCHAR(50) UNIQUE,
        type payment_discount_type NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3),
        duration payment_discount_duration NOT NULL,
        duration_in_months INT,
        start_at TIMESTAMPTZ,
        end_at TIMESTAMPTZ,
        max_uses INT,
        used_count INT DEFAULT 0,
        max_redemptions INT,
        redemptions_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        minimum_amount DECIMAL(10, 2),
        organization_id VARCHAR(25),
        metadata JSONB,
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
      CREATE TABLE IF NOT EXISTS payment_discounts_applicable_products (
        discount_id VARCHAR(25) NOT NULL,
        product_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (discount_id, product_id),
        CONSTRAINT fk_payment_discounts_applicable_products_discount FOREIGN KEY (discount_id) REFERENCES payment_discounts(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_discounts_applicable_products_product FOREIGN KEY (product_id) REFERENCES payment_products(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_discounts_applicable_plans (
        discount_id VARCHAR(25) NOT NULL,
        plan_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (discount_id, plan_id),
        CONSTRAINT fk_payment_discounts_applicable_plans_discount FOREIGN KEY (discount_id) REFERENCES payment_discounts(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_discounts_applicable_plans_plan FOREIGN KEY (plan_id) REFERENCES payment_plans(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_key ON payment_discounts(key)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_name ON payment_discounts(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_code ON payment_discounts(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_type ON payment_discounts(type)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_duration ON payment_discounts(duration)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_organization_id ON payment_discounts(organization_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_start_at ON payment_discounts(start_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_end_at ON payment_discounts(end_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_is_active ON payment_discounts(is_active)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_deleted_at ON payment_discounts(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_is_public ON payment_discounts(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_created_at ON payment_discounts(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_active ON payment_discounts(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_valid ON payment_discounts(is_active, start_at, end_at) WHERE deleted_at IS NULL AND is_active = true AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP) AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_applicable_products_discount_id ON payment_discounts_applicable_products(discount_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_applicable_products_product_id ON payment_discounts_applicable_products(product_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_applicable_plans_discount_id ON payment_discounts_applicable_plans(discount_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_discounts_applicable_plans_plan_id ON payment_discounts_applicable_plans(plan_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_discounts_applicable_plans CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_discounts_applicable_products CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_discounts CASCADE`;
    await tx`DROP TYPE IF EXISTS payment_discount_duration`;
    await tx`DROP TYPE IF EXISTS payment_discount_type`;
  }

  public getVersion(): string {
    return "20260118214514066";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225182218188, // payment_products table
      Migration20251225182218190, // payment_plans table
    ];
  }
}
