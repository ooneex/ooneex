import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@decorator.migration()
export class Migration20251225182641314 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users_followed (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25),
        followed_by VARCHAR(255),
        followed_by_id VARCHAR(25),
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
        CONSTRAINT fk_users_followed_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_users_followed_followed_by FOREIGN KEY (followed_by_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT uk_users_followed_user_followed_by UNIQUE (user_id, followed_by_id)
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_followed_user_id ON users_followed(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_followed_followed_by_id ON users_followed(followed_by_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_followed_created_at ON users_followed(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_followed_deleted_at ON users_followed(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_followed CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641314";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
