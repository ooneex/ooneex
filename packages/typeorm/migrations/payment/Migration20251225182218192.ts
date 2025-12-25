import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182218188 } from "./Migration20251225182218188";
import { Migration20251225182218190 } from "./Migration20251225182218190";

@migration()
export class Migration20251225182218192 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE discount_type AS ENUM ('percentage', 'fixed')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_coupons (
        id VARCHAR(25) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255),
        description TEXT,
        discount_type discount_type NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3),
        max_uses INT,
        used_count INT DEFAULT 0,
        start_at TIMESTAMPTZ,
        end_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT true,
        minimum_amount DECIMAL(10, 2),
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
      CREATE TABLE IF NOT EXISTS payment_coupons_applicable_products (
        coupon_id VARCHAR(25) NOT NULL,
        product_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (coupon_id, product_id),
        CONSTRAINT fk_payment_coupons_applicable_products_coupon FOREIGN KEY (coupon_id) REFERENCES payment_coupons(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_coupons_applicable_products_product FOREIGN KEY (product_id) REFERENCES payment_products(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_coupons_applicable_plans (
        coupon_id VARCHAR(25) NOT NULL,
        plan_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (coupon_id, plan_id),
        CONSTRAINT fk_payment_coupons_applicable_plans_coupon FOREIGN KEY (coupon_id) REFERENCES payment_coupons(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_coupons_applicable_plans_plan FOREIGN KEY (plan_id) REFERENCES payment_plans(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_code ON payment_coupons(code)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_discount_type ON payment_coupons(discount_type)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_is_active ON payment_coupons(is_active)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_start_at ON payment_coupons(start_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_end_at ON payment_coupons(end_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_language ON payment_coupons(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_deleted_at ON payment_coupons(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_is_public ON payment_coupons(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_created_at ON payment_coupons(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_active ON payment_coupons(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_valid ON payment_coupons(is_active, start_at, end_at) WHERE deleted_at IS NULL AND is_active = true AND (start_at IS NULL OR start_at <= CURRENT_TIMESTAMP) AND (end_at IS NULL OR end_at >= CURRENT_TIMESTAMP)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_applicable_products_coupon_id ON payment_coupons_applicable_products(coupon_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_applicable_products_product_id ON payment_coupons_applicable_products(product_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_applicable_plans_coupon_id ON payment_coupons_applicable_plans(coupon_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_coupons_applicable_plans_plan_id ON payment_coupons_applicable_plans(plan_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_coupons_applicable_plans CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_coupons_applicable_products CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_coupons CASCADE`;
    await tx`DROP TYPE IF EXISTS discount_type CASCADE`;
  }

  public getVersion(): string {
    return "20251225182218192";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225182218188, // Payment products table
      Migration20251225182218190, // Payment plans table
    ];
  }
}
