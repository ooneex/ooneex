import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@decorator.migration()
export class Migration20251225174628784 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_comments (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        comment TEXT NOT NULL,
        commented_by VARCHAR(255),
        commented_by_id VARCHAR(25),
        parent_comment_id VARCHAR(25),
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
        CONSTRAINT fk_folders_comments_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
        CONSTRAINT fk_folders_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES folders_comments(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_folder_id ON folders_comments(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_commented_by_id ON folders_comments(commented_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_parent_comment_id ON folders_comments(parent_comment_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_language ON folders_comments(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_deleted_at ON folders_comments(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_is_public ON folders_comments(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_created_at ON folders_comments(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_folder_created ON folders_comments(folder_id, created_at DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_comments_active ON folders_comments(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_comments CASCADE`;
  }

  public getVersion(): string {
    return "20251225174628784";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
    ];
  }
}
