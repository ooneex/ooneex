import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@migration()
export class Migration20251225181613481 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_stats (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
        likes_count INT DEFAULT 0,
        dislikes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        shares_count INT DEFAULT 0,
        saves_count INT DEFAULT 0,
        downloads_count INT DEFAULT 0,
        views_count INT DEFAULT 0,
        reports_count INT DEFAULT 0,
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMPTZ,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMPTZ,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT fk_images_stats_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_image_id ON images_stats(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_likes_count ON images_stats(likes_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_views_count ON images_stats(views_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_downloads_count ON images_stats(downloads_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_language ON images_stats(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_deleted_at ON images_stats(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_is_public ON images_stats(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_popular ON images_stats(is_public, likes_count DESC, views_count DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_created_at ON images_stats(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_stats_active ON images_stats(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613481";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225181613479, // Images table (for image_id foreign key)
    ];
  }
}
