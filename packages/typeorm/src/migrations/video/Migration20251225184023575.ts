import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023575 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS video_progress (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        user_id VARCHAR(15) NOT NULL,
        current_time INTEGER NOT NULL,
        duration INTEGER,
        completed BOOLEAN DEFAULT false,
        last_watched TIMESTAMP,
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
        CONSTRAINT fk_video_progress_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_progress_completed ON video_progress(completed)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_progress_user_video ON video_progress(user_id, video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_progress_created_at ON video_progress(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_progress_deleted_at ON video_progress(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS video_progress CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023575";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
