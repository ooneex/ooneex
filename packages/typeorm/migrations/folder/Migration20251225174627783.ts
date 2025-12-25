import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@migration()
export class Migration20251225174627783 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_stats (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        likes_count INT DEFAULT 0,
        dislikes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        shares_count INT DEFAULT 0,
        saves_count INT DEFAULT 0,
        downloads_count INT DEFAULT 0,
        views_count INT DEFAULT 0,
        reports_count INT DEFAULT 0,
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
        CONSTRAINT fk_folders_stats_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_folder_id ON folders_stats(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_likes_count ON folders_stats(likes_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_views_count ON folders_stats(views_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_downloads_count ON folders_stats(downloads_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_language ON folders_stats(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_deleted_at ON folders_stats(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_is_public ON folders_stats(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_popular ON folders_stats(is_public, likes_count DESC, views_count DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_created_at ON folders_stats(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_stats_active ON folders_stats(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225174627783";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
    ];
  }
}
