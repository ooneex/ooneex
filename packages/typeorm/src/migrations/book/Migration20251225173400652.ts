import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@decorator.migration()
export class Migration20251225173400652 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_viewed (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        viewed_by VARCHAR(255),
        viewed_by_id VARCHAR(25),
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
        CONSTRAINT fk_books_viewed_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_book_id ON books_viewed(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_viewed_by_id ON books_viewed(viewed_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_language ON books_viewed(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_deleted_at ON books_viewed(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_is_public ON books_viewed(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_created_at ON books_viewed(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_book_user ON books_viewed(book_id, viewed_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_viewed_active ON books_viewed(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_viewed CASCADE`;
  }

  public getVersion(): string {
    return "20251225173400652";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
