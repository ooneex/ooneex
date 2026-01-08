import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225181154491 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_stats (
        id VARCHAR(25) PRIMARY KEY,
        cards_studied_today INT DEFAULT 0,
        time_spent_today INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        total_reviews INT DEFAULT 0,
        total_study_time INT DEFAULT 0,
        retention_rate DECIMAL(5, 4) DEFAULT 0.0,
        new_cards_count INT DEFAULT 0,
        learning_cards_count INT DEFAULT 0,
        review_cards_count INT DEFAULT 0,
        suspended_cards_count INT DEFAULT 0,
        mature_cards_count INT DEFAULT 0,
        young_cards_count INT DEFAULT 0,
        again_count INT DEFAULT 0,
        hard_count INT DEFAULT 0,
        good_count INT DEFAULT 0,
        easy_count INT DEFAULT 0,
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_start_date ON flashcard_stats(start_date DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_end_date ON flashcard_stats(end_date DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_current_streak ON flashcard_stats(current_streak DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_retention_rate ON flashcard_stats(retention_rate DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_language ON flashcard_stats(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_deleted_at ON flashcard_stats(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_is_public ON flashcard_stats(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_created_at ON flashcard_stats(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_active ON flashcard_stats(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_stats_date_range ON flashcard_stats(start_date, end_date) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcard_stats CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154491";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
