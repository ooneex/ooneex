import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../common/Migration20251225173350644";
import { Migration20251225174626782 } from "./Migration20251225174626782";

@decorator.migration()
export class Migration20251225174635789 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS folders_reports (
        id VARCHAR(25) PRIMARY KEY,
        folder_id VARCHAR(25),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        reported_by VARCHAR(255),
        reported_by_id VARCHAR(25),
        status_id VARCHAR(25),
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
        CONSTRAINT fk_folders_reports_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
        CONSTRAINT fk_folders_reports_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_folder_id ON folders_reports(folder_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_reported_by_id ON folders_reports(reported_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_status_id ON folders_reports(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_reason ON folders_reports(reason)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_language ON folders_reports(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_deleted_at ON folders_reports(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_is_public ON folders_reports(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_created_at ON folders_reports(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_folder_status ON folders_reports(folder_id, status_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_folders_reports_active ON folders_reports(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS folders_reports CASCADE`;
  }

  public getVersion(): string {
    return "20251225174635789";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225174626782, // Folders table (for folder_id foreign key)
      Migration20251225173350644, // Statuses table (for status_id foreign key)
    ];
  }
}
