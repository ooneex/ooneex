import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@decorator.migration()
export class Migration20251225173357649 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_comments (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        comment TEXT NOT NULL,
        commented_by VARCHAR(255),
        commented_by_id VARCHAR(25),
        parent_comment_id VARCHAR(25),
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
        CONSTRAINT fk_books_comments_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        CONSTRAINT fk_books_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES books_comments(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_book_id ON books_comments(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_commented_by_id ON books_comments(commented_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_parent_comment_id ON books_comments(parent_comment_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_language ON books_comments(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_deleted_at ON books_comments(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_is_public ON books_comments(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_created_at ON books_comments(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_book_created ON books_comments(book_id, created_at DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_comments_active ON books_comments(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_comments CASCADE`;
  }

  public getVersion(): string {
    return "20251225173357649";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
