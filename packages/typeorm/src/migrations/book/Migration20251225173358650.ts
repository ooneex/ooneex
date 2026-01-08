import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@decorator.migration()
export class Migration20251225173358650 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_liked (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        liked_by VARCHAR(255),
        liked_by_id VARCHAR(25),
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
        CONSTRAINT fk_books_liked_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_book_id ON books_liked(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_liked_by_id ON books_liked(liked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_language ON books_liked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_deleted_at ON books_liked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_is_public ON books_liked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_created_at ON books_liked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_book_user ON books_liked(book_id, liked_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_liked_active ON books_liked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_liked CASCADE`;
  }

  public getVersion(): string {
    return "20251225173358650";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
