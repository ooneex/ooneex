import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023593 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS videos_shared (
        id VARCHAR(25) PRIMARY KEY,
        video_id VARCHAR(25),
        shared_with VARCHAR(255),
        shared_by_id VARCHAR(25),
        permission VARCHAR(50),
        expires_at TIMESTAMP,
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
        CONSTRAINT fk_videos_shared_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_shared_video_id ON videos_shared(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_shared_shared_by_id ON videos_shared(shared_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_shared_permission ON videos_shared(permission)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_shared_expires_at ON videos_shared(expires_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_shared_created_at ON videos_shared(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_shared_deleted_at ON videos_shared(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_shared CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023593";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
