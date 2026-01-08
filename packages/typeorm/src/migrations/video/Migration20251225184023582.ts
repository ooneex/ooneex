import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023582 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_liked (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        liked_by VARCHAR(255),
        liked_by_id VARCHAR(25),
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
        CONSTRAINT fk_videos_liked_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        CONSTRAINT uk_videos_liked_video_user UNIQUE (video_id, liked_by_id)
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_liked_video_id ON videos_liked(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_liked_liked_by_id ON videos_liked(liked_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_liked_created_at ON videos_liked(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_liked_deleted_at ON videos_liked(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_liked CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023582";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
