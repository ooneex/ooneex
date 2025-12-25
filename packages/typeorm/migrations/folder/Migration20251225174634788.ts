import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@migration()
export class Migration20251225174634788 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_shared (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        shared_with VARCHAR(255),
        shared_by_id VARCHAR(25),
        permission VARCHAR(50),
        expires_at TIMESTAMPTZ,
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
        CONSTRAINT fk_folders_shared_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_folder_id ON folders_shared(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_shared_by_id ON folders_shared(shared_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_permission ON folders_shared(permission)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_expires_at ON folders_shared(expires_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_language ON folders_shared(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_deleted_at ON folders_shared(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_is_public ON folders_shared(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_created_at ON folders_shared(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_folder_user ON folders_shared(folder_id, shared_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_active ON folders_shared(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_shared_active_not_expired ON folders_shared(expires_at) WHERE deleted_at IS NULL AND expires_at > NOW()
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_shared CASCADE`;
  }

  public getVersion(): string {
    return "20251225174634788";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
    ];
  }
}
