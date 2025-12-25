import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@migration()
export class Migration20251225180910449 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE mcq_choice_letter AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS mcq_question_choices (
        id VARCHAR(25) PRIMARY KEY,
        letter mcq_choice_letter NOT NULL,
        text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT false,
        explanation TEXT,
        question_id VARCHAR(25) NOT NULL,
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
        CONSTRAINT fk_mcq_question_choices_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_question_id ON mcq_question_choices(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_letter ON mcq_question_choices(letter)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_is_correct ON mcq_question_choices(is_correct)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_language ON mcq_question_choices(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_deleted_at ON mcq_question_choices(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_is_public ON mcq_question_choices(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_created_at ON mcq_question_choices(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_active ON mcq_question_choices(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_question_choices_question_letter ON mcq_question_choices(question_id, letter)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_question_choices CASCADE`;
    await tx`DROP TYPE IF EXISTS mcq_choice_letter CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910449";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910446, // MCQ questions table (for question_id foreign key)
    ];
  }
}
