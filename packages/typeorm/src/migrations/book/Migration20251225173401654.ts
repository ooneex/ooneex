import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@decorator.migration()
export class Migration20251225173401654 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_saved (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        saved_by VARCHAR(255),
        saved_by_id VARCHAR(25),
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
        CONSTRAINT fk_books_saved_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_book_id ON books_saved(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_saved_by_id ON books_saved(saved_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_language ON books_saved(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_deleted_at ON books_saved(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_is_public ON books_saved(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_created_at ON books_saved(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_book_user ON books_saved(book_id, saved_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_saved_active ON books_saved(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_saved CASCADE`;
  }

  public getVersion(): string {
    return "20251225173401654";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
