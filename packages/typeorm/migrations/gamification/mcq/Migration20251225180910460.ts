import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@migration()
export class Migration20251225180910460 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions_liked (
        id VARCHAR(25) PRIMARY KEY,
        question_id VARCHAR(25),
        liked_by VARCHAR(255),
        liked_by_id VARCHAR(25),
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
        CONSTRAINT fk_mcq_questions_liked_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_question_id ON mcq_questions_liked(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_liked_by_id ON mcq_questions_liked(liked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_language ON mcq_questions_liked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_deleted_at ON mcq_questions_liked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_is_public ON mcq_questions_liked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_created_at ON mcq_questions_liked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_liked_active ON mcq_questions_liked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mcq_questions_liked_unique ON mcq_questions_liked(question_id, liked_by_id) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_questions_liked CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910460";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910446, // MCQ questions table (for question_id foreign key)
    ];
  }
}
