import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@migration()
export class Migration20251225181613493 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_downloaded (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
        downloaded_by VARCHAR(255),
        downloaded_by_id VARCHAR(25),
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
        CONSTRAINT fk_images_downloaded_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_image_id ON images_downloaded(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_downloaded_by_id ON images_downloaded(downloaded_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_language ON images_downloaded(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_deleted_at ON images_downloaded(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_is_public ON images_downloaded(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_created_at ON images_downloaded(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_downloaded_active ON images_downloaded(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_downloaded CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613493";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
