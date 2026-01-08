import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182218190 } from "./Migration20251225182218190";
import { Migration20251225182218192 } from "./Migration20251225182218192";
import { Migration20251225182218195 } from "./Migration20251225182218195";

@decorator.migration()
export class Migration20251225182218197 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS payment_subscriptions (
        id VARCHAR(25) PRIMARY KEY,
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ,
        is_trial BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
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
      CREATE TABLE IF NOT EXISTS payment_subscriptions_coupons (
        subscription_id VARCHAR(25) NOT NULL,
        coupon_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (subscription_id, coupon_id),
        CONSTRAINT fk_payment_subscriptions_coupons_subscription FOREIGN KEY (subscription_id) REFERENCES payment_subscriptions(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_subscriptions_coupons_coupon FOREIGN KEY (coupon_id) REFERENCES payment_coupons(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_subscriptions_plans (
        subscription_id VARCHAR(25) NOT NULL,
        plan_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (subscription_id, plan_id),
        CONSTRAINT fk_payment_subscriptions_plans_subscription FOREIGN KEY (subscription_id) REFERENCES payment_subscriptions(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_subscriptions_plans_plan FOREIGN KEY (plan_id) REFERENCES payment_plans(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_subscriptions_credits (
        subscription_id VARCHAR(25) NOT NULL,
        credit_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (subscription_id, credit_id),
        CONSTRAINT fk_payment_subscriptions_credits_subscription FOREIGN KEY (subscription_id) REFERENCES payment_subscriptions(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_subscriptions_credits_credit FOREIGN KEY (credit_id) REFERENCES payment_credits(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_start_at ON payment_subscriptions(start_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_end_at ON payment_subscriptions(end_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_is_trial ON payment_subscriptions(is_trial)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_is_active ON payment_subscriptions(is_active)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_language ON payment_subscriptions(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_deleted_at ON payment_subscriptions(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_is_public ON payment_subscriptions(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_created_at ON payment_subscriptions(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_active ON payment_subscriptions(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_active_subs ON payment_subscriptions(is_active, start_at, end_at) WHERE deleted_at IS NULL AND is_active = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_coupons_subscription_id ON payment_subscriptions_coupons(subscription_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_coupons_coupon_id ON payment_subscriptions_coupons(coupon_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_plans_subscription_id ON payment_subscriptions_plans(subscription_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_plans_plan_id ON payment_subscriptions_plans(plan_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_credits_subscription_id ON payment_subscriptions_credits(subscription_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_subscriptions_credits_credit_id ON payment_subscriptions_credits(credit_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_subscriptions_credits CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_subscriptions_plans CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_subscriptions_coupons CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_subscriptions CASCADE`;
  }

  public getVersion(): string {
    return "20251225182218197";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225182218192, // Payment coupons table
      Migration20251225182218190, // Payment plans table
      Migration20251225182218195, // Payment credits table
    ];
  }
}
