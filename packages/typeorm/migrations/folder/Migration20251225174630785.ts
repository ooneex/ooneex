import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@migration()
export class Migration20251225174630785 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_disliked (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        disliked_by VARCHAR(255),
        disliked_by_id VARCHAR(25),
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
        CONSTRAINT fk_folders_disliked_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_folder_id ON folders_disliked(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_disliked_by_id ON folders_disliked(disliked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_language ON folders_disliked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_deleted_at ON folders_disliked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_is_public ON folders_disliked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_created_at ON folders_disliked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_folder_user ON folders_disliked(folder_id, disliked_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_disliked_active ON folders_disliked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_disliked CASCADE`;
  }

  public getVersion(): string {
    return "20251225174630785";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
    ];
  }
}
