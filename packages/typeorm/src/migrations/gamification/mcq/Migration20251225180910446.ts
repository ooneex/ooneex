import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../../common/Migration20251225173350644";
import { Migration20251225173351645 } from "../../common/Migration20251225173351645";

@decorator.migration()
export class Migration20251225180910446 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions (
        id VARCHAR(25) PRIMARY KEY,
        question_number INT NOT NULL,
        text TEXT NOT NULL,
        context VARCHAR(255),
        context_id VARCHAR(25),
        stat_id VARCHAR(25),
        status_id VARCHAR(25),
        image_id VARCHAR(25),
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
        CONSTRAINT fk_mcq_questions_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS mcq_questions_tags (
        question_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (question_id, tag_id),
        CONSTRAINT fk_mcq_questions_tags_question FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE,
        CONSTRAINT fk_mcq_questions_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_question_number ON mcq_questions(question_number)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_context ON mcq_questions(context, context_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_stat_id ON mcq_questions(stat_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_status_id ON mcq_questions(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_image_id ON mcq_questions(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_language ON mcq_questions(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_deleted_at ON mcq_questions(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_is_public ON mcq_questions(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_created_at ON mcq_questions(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_updated_at ON mcq_questions(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_active ON mcq_questions(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_tags_question_id ON mcq_questions_tags(question_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_mcq_questions_tags_tag_id ON mcq_questions_tags(tag_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS mcq_questions_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS mcq_questions CASCADE`;
  }

  public getVersion(): string {
    return "20251225180910446";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173350644, // Statuses table (for status_id foreign key)
      Migration20251225173351645, // Tags table (for mcq_questions_tags junction table)
    ];
  }
}
