import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../common/Migration20251225173350644";
import { Migration20251225173355647 } from "./Migration20251225173355647";

@migration()
export class Migration20251225173404658 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books_reports (
        id VARCHAR(25) PRIMARY KEY,
        book_id VARCHAR(25),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        reported_by VARCHAR(255),
        reported_by_id VARCHAR(25),
        status_id VARCHAR(25),
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
        CONSTRAINT fk_books_reports_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        CONSTRAINT fk_books_reports_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_book_id ON books_reports(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_reported_by_id ON books_reports(reported_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_status_id ON books_reports(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_reason ON books_reports(reason)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_language ON books_reports(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_deleted_at ON books_reports(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_is_public ON books_reports(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_created_at ON books_reports(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_book_status ON books_reports(book_id, status_id) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_reports_active ON books_reports(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_reports CASCADE`;
  }

  public getVersion(): string {
    return "20251225173404658";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173355647, // Books table (for book_id foreign key)
      Migration20251225173350644, // Statuses table (for status_id foreign key)
    ];
  }
}
