import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../../common/Migration20251225173350644";
import { Migration20251225173351645 } from "../../common/Migration20251225173351645";
import { Migration20251225181154477 } from "./Migration20251225181154477";
import { Migration20251225181154480 } from "./Migration20251225181154480";

@decorator.migration()
export class Migration20251225181154482 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS flashcards (
        id VARCHAR(25) PRIMARY KEY,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        hint TEXT,
        context VARCHAR(255),
        context_id VARCHAR(25),
        schedule_id VARCHAR(25) NOT NULL,
        deck_id VARCHAR(25),
        stat_id VARCHAR(25),
        status_id VARCHAR(25),
        image_id VARCHAR(25),
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
        CONSTRAINT fk_flashcards_schedule FOREIGN KEY (schedule_id) REFERENCES flashcard_schedules(id) ON DELETE CASCADE,
        CONSTRAINT fk_flashcards_deck FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE SET NULL,
        CONSTRAINT fk_flashcards_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS flashcards_tags (
        flashcard_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (flashcard_id, tag_id),
        CONSTRAINT fk_flashcards_tags_flashcard FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
        CONSTRAINT fk_flashcards_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_schedule_id ON flashcards(schedule_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_context ON flashcards(context, context_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_stat_id ON flashcards(stat_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_status_id ON flashcards(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_image_id ON flashcards(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_language ON flashcards(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_deleted_at ON flashcards(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_is_public ON flashcards(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_updated_at ON flashcards(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_active ON flashcards(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_tags_flashcard_id ON flashcards_tags(flashcard_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcards_tags_tag_id ON flashcards_tags(tag_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcards_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS flashcards CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154482";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225181154480, // Flashcard schedules table (for schedule_id foreign key)
      Migration20251225181154477, // Flashcard decks table (for deck_id foreign key)
      Migration20251225173350644, // Statuses table (for status_id foreign key)
      Migration20251225173351645, // Tags table (for flashcards_tags junction table)
    ];
  }
}
