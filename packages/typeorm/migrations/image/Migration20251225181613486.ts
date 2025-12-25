import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@migration()
export class Migration20251225181613486 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_liked (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
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
        CONSTRAINT fk_images_liked_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_image_id ON images_liked(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_liked_by_id ON images_liked(liked_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_language ON images_liked(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_deleted_at ON images_liked(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_is_public ON images_liked(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_created_at ON images_liked(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_liked_active ON images_liked(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_images_liked_unique ON images_liked(image_id, liked_by_id) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_liked CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613486";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
