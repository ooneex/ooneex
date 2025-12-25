import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173348643 } from "./Migration20251225173348643";

@migration()
export class Migration20251225173352645 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color_id VARCHAR(25),
        description TEXT,
        parent_id VARCHAR(25),
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
        CONSTRAINT fk_categories_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL,
        CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_color_id ON categories(color_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_language ON categories(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_parent_language ON categories(parent_id, language) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_parent_name ON categories(parent_id, name) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_is_public ON categories(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_name_lower ON categories(LOWER(name)) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_updated_at ON categories(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_name_sorted ON categories(name) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS categories CASCADE`;
  }

  public getVersion(): string {
    return "20251225173352645";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173348643, // Colors table (for color_id foreign key)
    ];
  }
}
