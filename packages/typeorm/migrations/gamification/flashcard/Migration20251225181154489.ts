import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181154482 } from "./Migration20251225181154482";
import { Migration20251225181154486 } from "./Migration20251225181154486";

@migration()
export class Migration20251225181154489 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE flashcard_rating AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_reviews (
        id VARCHAR(25) PRIMARY KEY,
        card_id VARCHAR(25) NOT NULL,
        session_id VARCHAR(25) NOT NULL,
        rating flashcard_rating NOT NULL,
        response_time INT NOT NULL,
        previous_interval INT NOT NULL,
        new_interval INT NOT NULL,
        previous_ease_factor DECIMAL(4, 2) NOT NULL,
        new_ease_factor DECIMAL(4, 2) NOT NULL,
        previous_due_date TIMESTAMPTZ NOT NULL,
        new_due_date TIMESTAMPTZ NOT NULL,
        previous_state flashcard_state NOT NULL,
        new_state flashcard_state NOT NULL,
        was_lapse BOOLEAN DEFAULT false,
        algorithm flashcard_algorithm NOT NULL,
        reviewed_at TIMESTAMPTZ NOT NULL,
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
        CONSTRAINT fk_flashcard_reviews_card FOREIGN KEY (card_id) REFERENCES flashcards(id) ON DELETE CASCADE,
        CONSTRAINT fk_flashcard_reviews_session FOREIGN KEY (session_id) REFERENCES flashcard_sessions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_id ON flashcard_reviews(card_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_session_id ON flashcard_reviews(session_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_rating ON flashcard_reviews(rating)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_algorithm ON flashcard_reviews(algorithm)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_reviewed_at ON flashcard_reviews(reviewed_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_was_lapse ON flashcard_reviews(was_lapse) WHERE was_lapse = true
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_language ON flashcard_reviews(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_deleted_at ON flashcard_reviews(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_is_public ON flashcard_reviews(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_created_at ON flashcard_reviews(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_active ON flashcard_reviews(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_reviewed ON flashcard_reviews(card_id, reviewed_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_session_reviewed ON flashcard_reviews(session_id, reviewed_at DESC)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcard_reviews CASCADE`;
    await tx`DROP TYPE IF EXISTS flashcard_rating CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154489";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225181154482, // Flashcards table (for card_id foreign key)
      Migration20251225181154486, // Flashcard sessions table (for session_id foreign key)
    ];
  }
}
