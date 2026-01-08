import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173348643 } from "./Migration20251225173348643";

@decorator.migration()
export class Migration20251225173350644 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE status_enum AS ENUM (
        'draft', 'pending', 'submitted',
        'inReview', 'reviewed',
        'processing', 'processed', 'queued',
        'ready', 'scheduled',
        'approved', 'rejected',
        'done', 'completed', 'success',
        'failed', 'error', 'cancelled', 'timeout',
        'archived', 'delete', 'deleted',
        'active', 'inactive', 'disabled', 'enabled',
        'suspended', 'paused', 'onHold',
        'sent', 'delivered', 'read',
        'valid', 'invalid', 'expired'
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS statuses (
        id VARCHAR(25) PRIMARY KEY,
        status status_enum NOT NULL,
        color_id VARCHAR(25),
        description TEXT,
        reason TEXT,
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMPTZ,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMPTZ,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT fk_statuses_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_status ON statuses(status)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_color_id ON statuses(color_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_language ON statuses(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_deleted_at ON statuses(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_status_language ON statuses(status, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_is_public ON statuses(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_updated_at ON statuses(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_created_at ON statuses(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_statuses_active ON statuses(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS statuses CASCADE`;
    await tx`DROP TYPE IF EXISTS status_enum CASCADE`;
  }

  public getVersion(): string {
    return "20251225173350644";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173348643, // Colors table (for color_id foreign key)
    ];
  }
}
