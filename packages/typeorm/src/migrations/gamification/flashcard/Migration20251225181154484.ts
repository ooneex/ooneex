import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225181154484 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS flashcard_presets (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        algorithm flashcard_algorithm DEFAULT 'FSRS',
        learning_steps JSON DEFAULT '[1, 10]',
        relearning_steps JSON DEFAULT '[10]',
        graduating_interval INT DEFAULT 1,
        easy_interval INT DEFAULT 4,
        max_interval INT DEFAULT 36500,
        max_new_cards_per_day INT DEFAULT 20,
        max_review_cards_per_day INT DEFAULT 200,
        desired_retention DECIMAL(4, 3) DEFAULT 0.9,
        fsrs_parameters JSON,
        starting_ease_factor DECIMAL(4, 2) DEFAULT 2.5,
        easy_bonus DECIMAL(4, 2) DEFAULT 1.3,
        interval_modifier DECIMAL(4, 2) DEFAULT 1.0,
        hard_interval DECIMAL(4, 2) DEFAULT 1.2,
        new_interval DECIMAL(4, 2) DEFAULT 0.0,
        minimum_interval INT DEFAULT 1,
        leech_threshold INT DEFAULT 8,
        bury_siblings BOOLEAN DEFAULT false,
        show_timer BOOLEAN DEFAULT false,
        auto_play_audio BOOLEAN DEFAULT true,
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
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_name ON flashcard_presets(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_algorithm ON flashcard_presets(algorithm)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_language ON flashcard_presets(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_deleted_at ON flashcard_presets(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_is_public ON flashcard_presets(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_created_at ON flashcard_presets(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_flashcard_presets_active ON flashcard_presets(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS flashcard_presets CASCADE`;
  }

  public getVersion(): string {
    return "20251225181154484";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
