import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@migration()
export class Migration20251225174629784 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_liked (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        liked_by VARCHAR(255),
        liked_by_id VARCHAR(25),
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
        CONSTRAINT fk_folders_liked_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_folder_id ON folders_liked(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_liked_by_id ON folders_liked(liked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_language ON folders_liked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_deleted_at ON folders_liked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_is_public ON folders_liked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_created_at ON folders_liked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_folder_user ON folders_liked(folder_id, liked_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_liked_active ON folders_liked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_liked CASCADE`;
  }

  public getVersion(): string {
    return "20251225174629784";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
    ];
  }
}
