import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173348643 } from "../common/Migration20251225173348643";

@decorator.migration()
export class Migration20251225174626782 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color_id VARCHAR(25),
        description TEXT,
        parent_id VARCHAR(25),
        context VARCHAR(255),
        context_id VARCHAR(25),
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
        CONSTRAINT fk_folders_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL,
        CONSTRAINT fk_folders_parent FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_color_id ON folders(color_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_context ON folders(context, context_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_language ON folders(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_deleted_at ON folders(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_is_public ON folders(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_name_lower ON folders(LOWER(name)) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_parent_name ON folders(parent_id, name) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_updated_at ON folders(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_active ON folders(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders CASCADE`;
  }

  public getVersion(): string {
    return "20251225174626782";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173348643, // Colors table (for color_id foreign key)
    ];
  }
}
