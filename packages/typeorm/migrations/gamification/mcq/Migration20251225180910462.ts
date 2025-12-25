import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@migration()
export class Migration20251225180910462 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions_disliked (
        id VARCHAR(25) PRIMARY KEY,
        question_id VARCHAR(25),
        disliked_by VARCHAR(255),
        disliked_by_id VARCHAR(25),
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
        CONSTRAINT fk_mcq_questions_disliked_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_question_id ON mcq_questions_disliked(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_disliked_by_id ON mcq_questions_disliked(disliked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_language ON mcq_questions_disliked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_deleted_at ON mcq_questions_disliked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_is_public ON mcq_questions_disliked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_created_at ON mcq_questions_disliked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_disliked_active ON mcq_questions_disliked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mcq_questions_disliked_unique ON mcq_questions_disliked(question_id, disliked_by_id) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_questions_disliked CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910462";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910446, // MCQ questions table (for question_id foreign key)
    ];
  }
}
