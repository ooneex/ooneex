import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@decorator.migration()
export class Migration20251225181613497 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_shared (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
        shared_with VARCHAR(255),
        shared_by_id VARCHAR(25),
        permission VARCHAR(50),
        expires_at TIMESTAMPTZ,
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
        CONSTRAINT fk_images_shared_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_image_id ON images_shared(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_shared_by_id ON images_shared(shared_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_expires_at ON images_shared(expires_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_language ON images_shared(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_deleted_at ON images_shared(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_is_public ON images_shared(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_created_at ON images_shared(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_active ON images_shared(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_shared_active_shares ON images_shared(expires_at) WHERE deleted_at IS NULL AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_shared CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613497";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
