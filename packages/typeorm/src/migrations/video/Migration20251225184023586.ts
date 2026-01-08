import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023586 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_viewed (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        viewed_by VARCHAR(255),
        viewed_by_id VARCHAR(25),
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
        CONSTRAINT fk_videos_viewed_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_viewed_video_id ON videos_viewed(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_viewed_viewed_by_id ON videos_viewed(viewed_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_viewed_created_at ON videos_viewed(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_viewed_deleted_at ON videos_viewed(deleted_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_viewed_video_user ON videos_viewed(video_id, viewed_by_id, created_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_viewed CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023586";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
