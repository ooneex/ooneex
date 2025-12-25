import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@migration()
export class Migration20251225182641310 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users_stats (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25),
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        blocked_count INTEGER DEFAULT 0,
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
        CONSTRAINT fk_users_stats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_stats_user_id ON users_stats(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_stats_followers_count ON users_stats(followers_count)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_stats_following_count ON users_stats(following_count)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_stats_views_count ON users_stats(views_count)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_stats_created_at ON users_stats(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_stats_deleted_at ON users_stats(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641310";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
