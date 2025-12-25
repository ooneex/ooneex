import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@migration()
export class Migration20251225181613488 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_disliked (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
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
        CONSTRAINT fk_images_disliked_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_image_id ON images_disliked(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_disliked_by_id ON images_disliked(disliked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_language ON images_disliked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_deleted_at ON images_disliked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_is_public ON images_disliked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_created_at ON images_disliked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_disliked_active ON images_disliked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_images_disliked_unique ON images_disliked(image_id, disliked_by_id) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_disliked CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613488";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
