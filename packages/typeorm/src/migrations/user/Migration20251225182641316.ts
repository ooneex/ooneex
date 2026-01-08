import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@decorator.migration()
export class Migration20251225182641316 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users_reports (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25),
        reason VARCHAR(255) NOT NULL,
        description TEXT,
        reported_by VARCHAR(255),
        reported_by_id VARCHAR(25),
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMP,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMP,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        CONSTRAINT fk_users_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_users_reports_reported_by FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_reports_user_id ON users_reports(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_reports_reported_by_id ON users_reports(reported_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_reports_reason ON users_reports(reason)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_reports_created_at ON users_reports(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_reports_deleted_at ON users_reports(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_reports CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641316";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
