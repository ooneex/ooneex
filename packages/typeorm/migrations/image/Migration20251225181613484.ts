import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@migration()
export class Migration20251225181613484 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_comments (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
        comment TEXT NOT NULL,
        commented_by VARCHAR(255),
        commented_by_id VARCHAR(25),
        parent_comment_id VARCHAR(25),
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
        CONSTRAINT fk_images_comments_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_image_id ON images_comments(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_commented_by_id ON images_comments(commented_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_parent_comment_id ON images_comments(parent_comment_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_language ON images_comments(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_deleted_at ON images_comments(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_is_public ON images_comments(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_created_at ON images_comments(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_comments_active ON images_comments(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_comments CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613484";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479];
  }
}
