import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../../common/Migration20251225173350644";

@migration()
export class Migration20251225181154477 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE flashcard_algorithm AS ENUM ('FSRS', 'SM2', 'ANKI')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_decks (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        total_cards INT DEFAULT 0,
        new_cards INT DEFAULT 0,
        learning_cards INT DEFAULT 0,
        due_cards INT DEFAULT 0,
        suspended_cards INT DEFAULT 0,
        algorithm flashcard_algorithm DEFAULT 'FSRS',
        max_new_cards_per_day INT DEFAULT 20,
        max_review_cards_per_day INT DEFAULT 200,
        desired_retention DECIMAL(4, 3) DEFAULT 0.9,
        learning_steps JSON DEFAULT '[1, 10]',
        relearning_steps JSON DEFAULT '[10]',
        graduating_interval INT DEFAULT 1,
        easy_interval INT DEFAULT 4,
        max_interval INT DEFAULT 36500,
        fsrs_parameters JSON,
        leech_threshold INT DEFAULT 8,
        bury_siblings BOOLEAN DEFAULT false,
        stat_id VARCHAR(25),
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
        CONSTRAINT fk_flashcard_decks_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_name ON flashcard_decks(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_algorithm ON flashcard_decks(algorithm)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_stat_id ON flashcard_decks(stat_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_status_id ON flashcard_decks(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_language ON flashcard_decks(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_deleted_at ON flashcard_decks(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_is_public ON flashcard_decks(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_created_at ON flashcard_decks(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_updated_at ON flashcard_decks(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_decks_active ON flashcard_decks(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcard_decks CASCADE`;
    await tx`DROP TYPE IF EXISTS flashcard_algorithm CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154477";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173350644, // Statuses table (for status_id foreign key)
    ];
  }
}
