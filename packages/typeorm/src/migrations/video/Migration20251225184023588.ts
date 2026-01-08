import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023588 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_downloaded (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        downloaded_by VARCHAR(255),
        downloaded_by_id VARCHAR(25),
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
        CONSTRAINT fk_videos_downloaded_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_downloaded_video_id ON videos_downloaded(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_downloaded_downloaded_by_id ON videos_downloaded(downloaded_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_downloaded_created_at ON videos_downloaded(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_downloaded_deleted_at ON videos_downloaded(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_downloaded CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023588";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
