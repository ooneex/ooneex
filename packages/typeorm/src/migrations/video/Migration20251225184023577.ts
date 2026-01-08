import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023577 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_stats (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        likes_count INTEGER DEFAULT 0,
        dislikes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        saves_count INTEGER DEFAULT 0,
        downloads_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        reports_count INTEGER DEFAULT 0,
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
        CONSTRAINT fk_videos_stats_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_stats_video_id ON videos_stats(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_stats_likes_count ON videos_stats(likes_count)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_stats_views_count ON videos_stats(views_count)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_stats_created_at ON videos_stats(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_stats_deleted_at ON videos_stats(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023577";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
