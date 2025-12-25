import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910444 } from "../Migration20251225180910444";
import { Migration20251225181154482 } from "./Migration20251225181154482";

@migration()
export class Migration20251225181154486 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE flashcard_session_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_sessions (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        total_cards INT DEFAULT 0,
        new_cards_count INT DEFAULT 0,
        learning_cards_count INT DEFAULT 0,
        review_cards_count INT DEFAULT 0,
        studied_count INT DEFAULT 0,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        study_time INT DEFAULT 0,
        status flashcard_session_status DEFAULT 'DRAFT',
        score DECIMAL(5, 2) DEFAULT 0,
        started_at TIMESTAMPTZ,
        paused_at TIMESTAMPTZ,
        resumed_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        type session_type NOT NULL,
        level_id VARCHAR(25) NOT NULL,
        algorithm flashcard_algorithm DEFAULT 'FSRS',
        max_new_cards INT DEFAULT 20,
        max_review_cards INT DEFAULT 200,
        desired_retention DECIMAL(4, 3) DEFAULT 0.9,
        learning_steps JSON DEFAULT '[1, 10]',
        graduating_interval INT DEFAULT 1,
        easy_interval INT DEFAULT 4,
        max_interval INT DEFAULT 36500,
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
        CONSTRAINT fk_flashcard_sessions_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_sessions_cards (
        session_id VARCHAR(25) NOT NULL,
        flashcard_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (session_id, flashcard_id),
        CONSTRAINT fk_flashcard_sessions_cards_session FOREIGN KEY (session_id) REFERENCES flashcard_sessions(id) ON DELETE CASCADE,
        CONSTRAINT fk_flashcard_sessions_cards_flashcard FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_name ON flashcard_sessions(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_status ON flashcard_sessions(status)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_type ON flashcard_sessions(type)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_level_id ON flashcard_sessions(level_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_algorithm ON flashcard_sessions(algorithm)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_score ON flashcard_sessions(score DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_started_at ON flashcard_sessions(started_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_completed_at ON flashcard_sessions(completed_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_language ON flashcard_sessions(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_deleted_at ON flashcard_sessions(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_is_public ON flashcard_sessions(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_created_at ON flashcard_sessions(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_updated_at ON flashcard_sessions(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_active ON flashcard_sessions(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_performance ON flashcard_sessions(type, score DESC, completed_at DESC) WHERE status = 'COMPLETED' AND deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_cards_session_id ON flashcard_sessions_cards(session_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_cards_flashcard_id ON flashcard_sessions_cards(flashcard_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcard_sessions_cards CASCADE`;
    await tx`DROP TABLE IF EXISTS flashcard_sessions CASCADE`;
    await tx`DROP TYPE IF EXISTS flashcard_session_status CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154486";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910444, // Levels table (for level_id foreign key)
      Migration20251225181154482, // Flashcards table (for flashcard_sessions_cards junction table)
    ];
  }
}
