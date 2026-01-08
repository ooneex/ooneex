import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@decorator.migration()
export class Migration20251225182641303 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users_sessions (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        refresh_token VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device VARCHAR(255),
        browser VARCHAR(255),
        os VARCHAR(255),
        is_revoked BOOLEAN DEFAULT false,
        revoked_at TIMESTAMP,
        last_activity_at TIMESTAMP,
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
        CONSTRAINT fk_users_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_user_id ON users_sessions(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_token ON users_sessions(token)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_refresh_token ON users_sessions(refresh_token)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_expires_at ON users_sessions(expires_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_is_revoked ON users_sessions(is_revoked)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_active ON users_sessions(user_id, is_revoked, expires_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_created_at ON users_sessions(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_sessions_deleted_at ON users_sessions(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_sessions CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641303";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
