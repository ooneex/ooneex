import { type IMigration, type MigrationClassType, migration } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@migration()
export class Migration20251225182641319 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users_viewed (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25),
        viewed_by VARCHAR(255),
        viewed_by_id VARCHAR(25),
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
        CONSTRAINT fk_users_viewed_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_users_viewed_viewed_by FOREIGN KEY (viewed_by_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_viewed_user_id ON users_viewed(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_viewed_viewed_by_id ON users_viewed(viewed_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_viewed_created_at ON users_viewed(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_viewed_deleted_at ON users_viewed(deleted_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_viewed_user_viewed_by ON users_viewed(user_id, viewed_by_id, created_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_viewed CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641319";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
