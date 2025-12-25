import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173348643 } from "./Migration20251225173348643";

@migration()
export class Migration20251225173351645 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color_id VARCHAR(25),
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
        CONSTRAINT fk_tags_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_color_id ON tags(color_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_language ON tags(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_deleted_at ON tags(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_name_language ON tags(name, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_is_public ON tags(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_name_lower ON tags(LOWER(name)) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_updated_at ON tags(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS tags CASCADE`;
  }

  public getVersion(): string {
    return "20251225173351645";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173348643, // Colors table (for color_id foreign key)
    ];
  }
}
