import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@decorator.migration()
export class Migration20251225180910465 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions_viewed (
        id VARCHAR(25) PRIMARY KEY,
        question_id VARCHAR(25),
        viewed_by VARCHAR(255),
        viewed_by_id VARCHAR(25),
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
        CONSTRAINT fk_mcq_questions_viewed_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_question_id ON mcq_questions_viewed(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_viewed_by_id ON mcq_questions_viewed(viewed_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_language ON mcq_questions_viewed(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_deleted_at ON mcq_questions_viewed(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_is_public ON mcq_questions_viewed(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_created_at ON mcq_questions_viewed(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_viewed_active ON mcq_questions_viewed(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_questions_viewed CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910465";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910446, // MCQ questions table (for question_id foreign key)
    ];
  }
}
