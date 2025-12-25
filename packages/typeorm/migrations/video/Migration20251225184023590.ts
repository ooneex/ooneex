import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@migration()
export class Migration20251225184023590 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_saved (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        saved_by VARCHAR(255),
        saved_by_id VARCHAR(25),
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
        CONSTRAINT fk_videos_saved_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        CONSTRAINT uk_videos_saved_video_user UNIQUE (video_id, saved_by_id)
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_saved_video_id ON videos_saved(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_saved_saved_by_id ON videos_saved(saved_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_saved_created_at ON videos_saved(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_saved_deleted_at ON videos_saved(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_saved CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023590";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
