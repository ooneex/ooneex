import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225173348643 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS colors (
        id VARCHAR(25) PRIMARY KEY,
        hex VARCHAR(7),
        rgb VARCHAR(50),
        rgba VARCHAR(60),
        hsl VARCHAR(50),
        hsla VARCHAR(60),
        alpha DECIMAL(3, 2),
        red INT,
        green INT,
        blue INT,
        hue INT,
        saturation INT,
        lightness INT,
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
      CREATE INDEX IF NOT EXISTS idx_colors_hex ON colors(hex)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_language ON colors(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_deleted_at ON colors(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_is_public ON colors(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_is_public_language ON colors(is_public, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_blocked ON colors(is_blocked, blocked_at) WHERE is_blocked = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_updated_at ON colors(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_created_at ON colors(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_colors_active ON colors(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS colors CASCADE`;
  }

  public getVersion(): string {
    return "20251225173348643";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
