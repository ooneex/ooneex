import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225181154480 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE flashcard_state AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING', 'SUSPENDED')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_schedules (
        id VARCHAR(25) PRIMARY KEY,
        state flashcard_state DEFAULT 'NEW',
        interval INT DEFAULT 0,
        ease_factor DECIMAL(4, 2) DEFAULT 2.5,
        review_count INT DEFAULT 0,
        lapse_count INT DEFAULT 0,
        current_step INT DEFAULT 0,
        due_date TIMESTAMPTZ NOT NULL,
        last_reviewed_at TIMESTAMPTZ,
        difficulty DECIMAL(4, 2),
        stability DECIMAL(10, 4),
        retrievability DECIMAL(4, 3),
        learning_steps JSON DEFAULT '[]',
        relearning_steps JSON DEFAULT '[]',
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMPTZ,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMPTZ,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_state ON flashcard_schedules(state)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_due_date ON flashcard_schedules(due_date)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_last_reviewed_at ON flashcard_schedules(last_reviewed_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_interval ON flashcard_schedules(interval)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_language ON flashcard_schedules(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_deleted_at ON flashcard_schedules(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_is_public ON flashcard_schedules(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_created_at ON flashcard_schedules(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_active ON flashcard_schedules(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_schedules_due ON flashcard_schedules(state, due_date) WHERE deleted_at IS NULL AND due_date <= CURRENT_TIMESTAMP
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcard_schedules CASCADE`;
    await tx`DROP TYPE IF EXISTS flashcard_state CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154480";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
