import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910444 } from "../Migration20251225180910444";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@decorator.migration()
export class Migration20251225180910451 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE mcq_session_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED')
    `;

    await tx`
      CREATE TYPE session_type AS ENUM (
        'TRAINING', 'PRACTICE', 'SIMULATION', 'QUIZ',
        'CHALLENGE', 'TOURNAMENT', 'REVIEW', 'DIAGNOSTIC', 'SPEED_TEST'
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS mcq_sessions (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        total_questions INT DEFAULT 0,
        answered_count INT DEFAULT 0,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        timing INT DEFAULT 0,
        status mcq_session_status DEFAULT 'DRAFT',
        score DECIMAL(5, 2) DEFAULT 0,
        started_at TIMESTAMPTZ,
        paused_at TIMESTAMPTZ,
        resumed_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        type session_type NOT NULL,
        level_id VARCHAR(25) NOT NULL,
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
        CONSTRAINT fk_mcq_sessions_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS mcq_sessions_questions (
        session_id VARCHAR(25) NOT NULL,
        question_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (session_id, question_id),
        CONSTRAINT fk_mcq_sessions_questions_session FOREIGN KEY (session_id) REFERENCES mcq_sessions(id) ON DELETE CASCADE,
        CONSTRAINT fk_mcq_sessions_questions_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_name ON mcq_sessions(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_status ON mcq_sessions(status)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_type ON mcq_sessions(type)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_level_id ON mcq_sessions(level_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_score ON mcq_sessions(score DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_started_at ON mcq_sessions(started_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_completed_at ON mcq_sessions(completed_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_language ON mcq_sessions(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_deleted_at ON mcq_sessions(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_is_public ON mcq_sessions(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_created_at ON mcq_sessions(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_updated_at ON mcq_sessions(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_active ON mcq_sessions(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_performance ON mcq_sessions(type, score DESC, completed_at DESC) WHERE status = 'COMPLETED' AND deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_questions_session_id ON mcq_sessions_questions(session_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_sessions_questions_question_id ON mcq_sessions_questions(question_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_sessions_questions CASCADE`;
    await tx`DROP TABLE IF EXISTS mcq_sessions CASCADE`;
    await tx`DROP TYPE IF EXISTS session_type CASCADE`;
    await tx`DROP TYPE IF EXISTS mcq_session_status CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910451";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910444, // Levels table (for level_id foreign key)
      Migration20251225180910446, // MCQ questions table (for mcq_sessions_questions junction table)
    ];
  }
}
