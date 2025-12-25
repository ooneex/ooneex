import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251225173349644 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS stats (
        id VARCHAR(25) PRIMARY KEY,
        comment_count INT DEFAULT 0 NOT NULL,
        like_count INT DEFAULT 0 NOT NULL,
        share_count INT DEFAULT 0 NOT NULL,
        view_count INT DEFAULT 0 NOT NULL,
        download_count INT DEFAULT 0 NOT NULL,
        bookmark_count INT DEFAULT 0 NOT NULL,
        repost_count INT DEFAULT 0 NOT NULL,
        impression_count INT DEFAULT 0 NOT NULL,
        click_count INT DEFAULT 0 NOT NULL,
        engagement_rate DECIMAL(5, 4) DEFAULT 0 NOT NULL,
        reach INT DEFAULT 0 NOT NULL,
        follower_count INT DEFAULT 0 NOT NULL,
        following_count INT DEFAULT 0 NOT NULL,
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMPTZ,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMPTZ,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_language ON stats(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_deleted_at ON stats(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_engagement_rate ON stats(engagement_rate DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_view_count ON stats(view_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_like_count ON stats(like_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_popular ON stats(is_public, view_count DESC, like_count DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_follower_count ON stats(follower_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_is_public ON stats(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_updated_at ON stats(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_created_at ON stats(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_active ON stats(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225173349644";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
