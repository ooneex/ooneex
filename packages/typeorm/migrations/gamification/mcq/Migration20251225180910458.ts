import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@migration()
export class Migration20251225180910458 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions_comments (
        id VARCHAR(25) PRIMARY KEY,
        question_id VARCHAR(25),
        comment TEXT NOT NULL,
        commented_by VARCHAR(255),
        commented_by_id VARCHAR(25),
        parent_comment_id VARCHAR(25),
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
        CONSTRAINT fk_mcq_questions_comments_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_question_id ON mcq_questions_comments(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_commented_by_id ON mcq_questions_comments(commented_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_parent_comment_id ON mcq_questions_comments(parent_comment_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_language ON mcq_questions_comments(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_deleted_at ON mcq_questions_comments(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_is_public ON mcq_questions_comments(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_created_at ON mcq_questions_comments(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_comments_active ON mcq_questions_comments(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_questions_comments CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910458";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910446, // MCQ questions table (for question_id foreign key)
    ];
  }
}
