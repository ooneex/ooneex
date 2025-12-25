import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@migration()
export class Migration20251225173359651 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_disliked (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        disliked_by VARCHAR(255),
        disliked_by_id VARCHAR(25),
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
        CONSTRAINT fk_books_disliked_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_book_id ON books_disliked(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_disliked_by_id ON books_disliked(disliked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_language ON books_disliked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_deleted_at ON books_disliked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_is_public ON books_disliked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_created_at ON books_disliked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_book_user ON books_disliked(book_id, disliked_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_disliked_active ON books_disliked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_disliked CASCADE`;
  }

  public getVersion(): string {
    return "20251225173359651";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
