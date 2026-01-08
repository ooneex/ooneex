import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@decorator.migration()
export class Migration20251225182641305 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`CREATE TYPE verification_type AS ENUM ('email', 'phone', 'two_factor')`;

    await tx`
      CREATE TABLE IF NOT EXISTS users_verifications (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25) NOT NULL,
        type verification_type NOT NULL,
        token VARCHAR(255) NOT NULL,
        code VARCHAR(10),
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
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
        CONSTRAINT fk_users_verifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_user_id ON users_verifications(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_token ON users_verifications(token)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_code ON users_verifications(code)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_type ON users_verifications(type)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_expires_at ON users_verifications(expires_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_verified_at ON users_verifications(verified_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_created_at ON users_verifications(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_verifications_deleted_at ON users_verifications(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_verifications CASCADE`;
    await tx`DROP TYPE IF EXISTS verification_type CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641305";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298];
  }
}
