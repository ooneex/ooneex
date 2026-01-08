import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@decorator.migration()
export class Migration20251225181613490 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_viewed (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
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
        CONSTRAINT fk_images_viewed_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_image_id ON images_viewed(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_viewed_by_id ON images_viewed(viewed_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_language ON images_viewed(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_deleted_at ON images_viewed(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_is_public ON images_viewed(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_created_at ON images_viewed(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_viewed_active ON images_viewed(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_viewed CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613490";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
