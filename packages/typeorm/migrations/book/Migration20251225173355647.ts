import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../common/Migration20251225173350644";
import { Migration20251225173351645 } from "../common/Migration20251225173351645";
import { Migration20251225173352645 } from "../common/Migration20251225173352645";
import { Migration20251225173353646 } from "./Migration20251225173353646";
import { Migration20251225173354646 } from "./Migration20251225173354646";

@migration()
export class Migration20251225173355647 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(25) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        subtitle VARCHAR(500),
        isbn VARCHAR(13),
        isbn13 VARCHAR(17),
        publisher_id VARCHAR(25),
        published_date DATE,
        description TEXT,
        page_count INT,
        category_id VARCHAR(25),
        genres JSON,
        size BIGINT,
        url TEXT,
        cover_image TEXT,
        context VARCHAR(255),
        context_id VARCHAR(25),
        average_rating DECIMAL(3, 2),
        ratings_count INT,
        edition VARCHAR(100),
        series VARCHAR(200),
        series_volume INT,
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
        CONSTRAINT fk_books_publisher FOREIGN KEY (publisher_id) REFERENCES book_publishers(id) ON DELETE SET NULL,
        CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        CONSTRAINT fk_books_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS books_authors (
        book_id VARCHAR(25) NOT NULL,
        author_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (book_id, author_id),
        CONSTRAINT fk_books_authors_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        CONSTRAINT fk_books_authors_author FOREIGN KEY (author_id) REFERENCES book_authors(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS books_tags (
        book_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (book_id, tag_id),
        CONSTRAINT fk_books_tags_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        CONSTRAINT fk_books_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON books(isbn13)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_publisher_id ON books(publisher_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_status_id ON books(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_language ON books(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_deleted_at ON books(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_context ON books(context, context_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_series ON books(series, series_volume)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_published_date ON books(published_date DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_average_rating ON books(average_rating DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_ratings_count ON books(ratings_count DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_is_public ON books(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_title_lower ON books(LOWER(title)) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_popular ON books(is_public, average_rating DESC, ratings_count DESC) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_active ON books(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_authors_book_id ON books_authors(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_authors_author_id ON books_authors(author_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_tags_book_id ON books_tags(book_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_books_tags_tag_id ON books_tags(tag_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS books_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS books_authors CASCADE`;
    await tx`DROP TABLE IF EXISTS books CASCADE`;
  }

  public getVersion(): string {
    return "20251225173355647";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173353646, // Book authors table (for books_authors junction table)
      Migration20251225173354646, // Book publishers table (for publisher_id foreign key)
      Migration20251225173350644, // Statuses table (for status_id foreign key)
      Migration20251225173351645, // Tags table (for books_tags junction table)
      Migration20251225173352645, // Categories table (for category_id foreign key)
    ];
  }
}
