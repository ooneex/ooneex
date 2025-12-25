import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@migration()
export class Migration20251225184023595 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_reports (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        reported_by VARCHAR(255),
        reported_by_id VARCHAR(25),
        status_id VARCHAR(25),
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMP,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMP,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        CONSTRAINT fk_videos_reports_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        CONSTRAINT fk_videos_reports_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_reports_video_id ON videos_reports(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_reports_reported_by_id ON videos_reports(reported_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_reports_status_id ON videos_reports(status_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_reports_reason ON videos_reports(reason)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_reports_created_at ON videos_reports(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_reports_deleted_at ON videos_reports(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_reports CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023595";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
