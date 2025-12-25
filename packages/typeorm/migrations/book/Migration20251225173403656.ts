import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@migration()
export class Migration20251225173403656 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_shared (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        shared_with VARCHAR(255),
        shared_by_id VARCHAR(25),
        permission VARCHAR(50),
        expires_at TIMESTAMPTZ,
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
        CONSTRAINT fk_books_shared_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_book_id ON books_shared(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_shared_by_id ON books_shared(shared_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_permission ON books_shared(permission)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_expires_at ON books_shared(expires_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_language ON books_shared(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_deleted_at ON books_shared(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_is_public ON books_shared(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_created_at ON books_shared(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_book_user ON books_shared(book_id, shared_by_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_active ON books_shared(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_shared_active_not_expired ON books_shared(expires_at) WHERE deleted_at IS NULL AND expires_at > NOW()
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_shared CASCADE`;
  }

  public getVersion(): string {
    return "20251225173403656";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
    ];
  }
}
