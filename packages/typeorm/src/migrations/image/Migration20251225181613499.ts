import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173350644 } from "../common/Migration20251225173350644";
import { Migration20251225181613479 } from "./Migration20251225181613479";

@decorator.migration()
export class Migration20251225181613499 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS images_reports (
        id VARCHAR(25) PRIMARY KEY,
        image_id VARCHAR(25),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        reported_by VARCHAR(255),
        reported_by_id VARCHAR(25),
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
        CONSTRAINT fk_images_reports_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
        CONSTRAINT fk_images_reports_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_image_id ON images_reports(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_reported_by_id ON images_reports(reported_by_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_status_id ON images_reports(status_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_reason ON images_reports(reason)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_language ON images_reports(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_deleted_at ON images_reports(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_is_public ON images_reports(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_created_at ON images_reports(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_images_reports_active ON images_reports(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS images_reports CASCADE`;
  }

  public getVersion(): string {
    return "20251225181613499";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225181613479, Migration20251225173350644];
  }
}
