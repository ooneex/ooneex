import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@migration()
export class Migration20251225173356648 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_stats (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
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
        CONSTRAINT fk_books_stats_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_book_id ON books_stats(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_likes_count ON books_stats(likes_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_views_count ON books_stats(views_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_downloads_count ON books_stats(downloads_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_language ON books_stats(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_deleted_at ON books_stats(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_is_public ON books_stats(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_popular ON books_stats(is_public, likes_count DESC, views_count DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_created_at ON books_stats(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_stats_active ON books_stats(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225173356648";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
