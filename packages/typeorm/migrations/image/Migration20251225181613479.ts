import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../common/Migration20251225173350644";
import { Migration20251225173351645 } from "../common/Migration20251225173351645";

@migration()
export class Migration20251225181613479 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE image_format AS ENUM (
        'jpeg', 'jpg', 'png', 'webp', 'gif', 'svg', 'avif',
        'bmp', 'tiff', 'ico', 'heic', 'heif'
      )
    `;

    await tx`
      CREATE TYPE image_mime AS ENUM (
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'image/svg+xml', 'image/avif', 'image/bmp', 'image/x-ms-bmp',
        'image/tiff', 'image/vnd.microsoft.icon', 'image/x-icon',
        'image/heic', 'image/heif'
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS images (
        id VARCHAR(25) PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        width INT,
        height INT,
        alt VARCHAR(255),
        title VARCHAR(255),
        format image_format,
        mime_type image_mime,
        size BIGINT,
        metadata JSONB,
        context VARCHAR(255),
        context_id VARCHAR(25),
        status_id VARCHAR(25),
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
        CONSTRAINT fk_images_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS images_tags (
        image_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (image_id, tag_id),
        CONSTRAINT fk_images_tags_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
        CONSTRAINT fk_images_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_url ON images(url)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_format ON images(format)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_mime_type ON images(mime_type)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_size ON images(size)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_context ON images(context, context_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_status_id ON images(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_language ON images(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_deleted_at ON images(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_updated_at ON images(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_active ON images(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_dimensions ON images(width, height) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_tags_image_id ON images_tags(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_tags_tag_id ON images_tags(tag_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS images CASCADE`;
    await tx`DROP TYPE IF EXISTS image_mime CASCADE`;
    await tx`DROP TYPE IF EXISTS image_format CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613479";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173350644, // Statuses table (for status_id foreign key)
      Migration20251225173351645, // Tags table (for images_tags junction table)
    ];
  }
}
