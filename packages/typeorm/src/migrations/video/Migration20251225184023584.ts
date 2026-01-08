import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023584 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_disliked (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        disliked_by VARCHAR(255),
        disliked_by_id VARCHAR(25),
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
        CONSTRAINT fk_videos_disliked_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        CONSTRAINT uk_videos_disliked_video_user UNIQUE (video_id, disliked_by_id)
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_disliked_video_id ON videos_disliked(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_disliked_disliked_by_id ON videos_disliked(disliked_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_disliked_created_at ON videos_disliked(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_disliked_deleted_at ON videos_disliked(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_disliked CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023584";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
