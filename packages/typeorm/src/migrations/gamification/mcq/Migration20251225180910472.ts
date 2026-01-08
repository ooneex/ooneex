import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../../common/Migration20251225173350644";
import { Migration20251225180910446 } from "./Migration20251225180910446";

@decorator.migration()
export class Migration20251225180910472 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions_reports (
        id VARCHAR(25) PRIMARY KEY,
        question_id VARCHAR(25),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        reported_by VARCHAR(255),
        reported_by_id VARCHAR(25),
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
        CONSTRAINT fk_mcq_questions_reports_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE,
        CONSTRAINT fk_mcq_questions_reports_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_question_id ON mcq_questions_reports(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_reported_by_id ON mcq_questions_reports(reported_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_status_id ON mcq_questions_reports(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_reason ON mcq_questions_reports(reason)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_language ON mcq_questions_reports(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_deleted_at ON mcq_questions_reports(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_is_public ON mcq_questions_reports(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_created_at ON mcq_questions_reports(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_reports_active ON mcq_questions_reports(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_questions_reports CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910472";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225180910446, // MCQ questions table (for question_id foreign key)
      Migration20251225173350644, // Statuses table (for status_id foreign key)
    ];
  }
}
