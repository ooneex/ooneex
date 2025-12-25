import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@migration()
export class Migration20251225174633787 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_downloaded (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        downloaded_by VARCHAR(255),
        downloaded_by_id VARCHAR(25),
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
        CONSTRAINT fk_folders_downloaded_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_folder_id ON folders_downloaded(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_downloaded_by_id ON folders_downloaded(downloaded_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_language ON folders_downloaded(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_deleted_at ON folders_downloaded(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_is_public ON folders_downloaded(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_created_at ON folders_downloaded(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_folder_user ON folders_downloaded(folder_id, downloaded_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_downloaded_active ON folders_downloaded(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_downloaded CASCADE`;
  }

  public getVersion(): string {
    return "20251225174633787";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
    ];
  }
}
