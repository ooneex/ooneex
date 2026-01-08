import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@decorator.migration()
export class Migration20251225181613495 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_saved (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
        saved_by VARCHAR(255),
        saved_by_id VARCHAR(25),
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
        CONSTRAINT fk_images_saved_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_image_id ON images_saved(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_saved_by_id ON images_saved(saved_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_language ON images_saved(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_deleted_at ON images_saved(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_is_public ON images_saved(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_created_at ON images_saved(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_saved_active ON images_saved(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_images_saved_unique ON images_saved(image_id, saved_by_id) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_saved CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613495";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
