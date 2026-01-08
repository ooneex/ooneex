import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@decorator.migration()
export class Migration20251225182641312 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users_blocked (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25),
        blocked_by VARCHAR(255),
        blocked_by_id VARCHAR(25),
        reason TEXT,
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
        CONSTRAINT fk_users_blocked_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_users_blocked_blocked_by FOREIGN KEY (blocked_by_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT uk_users_blocked_user_blocked_by UNIQUE (user_id, blocked_by_id)
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_blocked_user_id ON users_blocked(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_blocked_blocked_by_id ON users_blocked(blocked_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_blocked_created_at ON users_blocked(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_blocked_deleted_at ON users_blocked(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_blocked CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641312";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
