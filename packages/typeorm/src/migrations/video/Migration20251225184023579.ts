import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023579 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_comments (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        comment TEXT NOT NULL,
        commented_by VARCHAR(255),
        commented_by_id VARCHAR(25),
        parent_comment_id VARCHAR(25),
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
        CONSTRAINT fk_videos_comments_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        CONSTRAINT fk_videos_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES videos_comments(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_comments_video_id ON videos_comments(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_comments_commented_by_id ON videos_comments(commented_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_comments_parent_comment_id ON videos_comments(parent_comment_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_comments_created_at ON videos_comments(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_comments_deleted_at ON videos_comments(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_comments CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023579";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
