import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@migration()
export class Migration20251225173349644 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS stats (
        id VARCHAR(25) PRIMARY KEY,
        comments_count INT DEFAULT 0 NOT NULL,
        likes_count INT DEFAULT 0 NOT NULL,
        dislikes_count INT DEFAULT 0 NOT NULL,
        shares_count INT DEFAULT 0 NOT NULL,
        views_count INT DEFAULT 0 NOT NULL,
        downloads_count INT DEFAULT 0 NOT NULL,
        saves_count INT DEFAULT 0 NOT NULL,
        bookmarks_count INT DEFAULT 0 NOT NULL,
        reposts_count INT DEFAULT 0 NOT NULL,
        impressions_count INT DEFAULT 0 NOT NULL,
        clicks_count INT DEFAULT 0 NOT NULL,
        engagement_rate DECIMAL(5, 4) DEFAULT 0 NOT NULL,
        reach INT DEFAULT 0 NOT NULL,
        followers_count INT DEFAULT 0 NOT NULL,
        following_count INT DEFAULT 0 NOT NULL,
        blocked_count INT DEFAULT 0 NOT NULL,
        reports_count INT DEFAULT 0 NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_stats_views_count ON stats(views_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_likes_count ON stats(likes_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_popular ON stats(is_public, views_count DESC, likes_count DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_stats_followers_count ON stats(followers_count DESC)
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
