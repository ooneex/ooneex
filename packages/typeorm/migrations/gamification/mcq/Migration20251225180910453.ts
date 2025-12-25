import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910449 } from "./Migration20251225180910449";
import { Migration20251225180910451 } from "./Migration20251225180910451";

@migration()
export class Migration20251225180910453 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE answer_state AS ENUM ('UNANSWERED', 'CORRECT', 'INCORRECT', 'PARTIAL', 'SKIPPED')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS mcq_session_questions (
        id VARCHAR(25) PRIMARY KEY,
        session_id VARCHAR(25) NOT NULL,
        question_id VARCHAR(25) NOT NULL,
        question_number INT NOT NULL,
        context VARCHAR(255),
        context_id VARCHAR(25),
        state answer_state NOT NULL,
        score DECIMAL(5, 2) DEFAULT 0,
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
        CONSTRAINT fk_mcq_session_questions_session FOREIGN KEY (session_id) REFERENCES mcq_sessions(id) ON DELETE CASCADE,
        CONSTRAINT fk_mcq_session_questions_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE RESTRICT
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS mcq_session_questions_selected_choices (
        session_question_id VARCHAR(25) NOT NULL,
        choice_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (session_question_id, choice_id),
        CONSTRAINT fk_mcq_session_questions_selected_choices_session_question FOREIGN KEY (session_question_id) REFERENCES mcq_session_questions(id) ON DELETE CASCADE,
        CONSTRAINT fk_mcq_session_questions_selected_choices_choice FOREIGN KEY (choice_id) REFERENCES mcq_question_choices(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_session_id ON mcq_session_questions(session_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_question_id ON mcq_session_questions(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_question_number ON mcq_session_questions(question_number)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_state ON mcq_session_questions(state)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_context ON mcq_session_questions(context, context_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_score ON mcq_session_questions(score DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_language ON mcq_session_questions(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_deleted_at ON mcq_session_questions(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_is_public ON mcq_session_questions(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_created_at ON mcq_session_questions(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_active ON mcq_session_questions(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_session_question ON mcq_session_questions(session_id, question_number)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_selected_choices_session_question_id ON mcq_session_questions_selected_choices(session_question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_session_questions_selected_choices_choice_id ON mcq_session_questions_selected_choices(choice_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_session_questions_selected_choices CASCADE`;
    await tx`DROP TABLE IF EXISTS mcq_session_questions CASCADE`;
    await tx`DROP TYPE IF EXISTS answer_state CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910453";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910449, // MCQ question choices table (for mcq_session_questions_selected_choices junction table)
      Migration20251225180910451, // MCQ sessions table (for session_id foreign key)
    ];
  }
}
