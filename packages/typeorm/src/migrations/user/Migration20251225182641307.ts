import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";
import { Migration20251225182641305 } from "./Migration20251225182641305";

@decorator.migration()
export class Migration20251225182641307 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`CREATE TYPE profile_update_status AS ENUM ('pending', 'approved', 'rejected', 'applied')`;

    await tx`
      CREATE TABLE IF NOT EXISTS users_profile_updates (
        id VARCHAR(25) PRIMARY KEY,
        user_id VARCHAR(25) NOT NULL,
        verification_id VARCHAR(25),
        changed_fields TEXT NOT NULL,
        previous_values JSONB,
        new_values JSONB,
        update_reason VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        requires_verification BOOLEAN DEFAULT false,
        status profile_update_status NOT NULL,
        applied_at TIMESTAMP,
        metadata JSONB,
        description TEXT,
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
        CONSTRAINT fk_users_profile_updates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_users_profile_updates_verification FOREIGN KEY (verification_id) REFERENCES users_verifications(id) ON DELETE SET NULL
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_users_profile_updates_user_id ON users_profile_updates(user_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_profile_updates_verification_id ON users_profile_updates(verification_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_profile_updates_status ON users_profile_updates(status)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_profile_updates_applied_at ON users_profile_updates(applied_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_profile_updates_created_at ON users_profile_updates(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_users_profile_updates_deleted_at ON users_profile_updates(deleted_at)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users_profile_updates CASCADE`;
    await tx`DROP TYPE IF EXISTS profile_update_status CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641307";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225182641298, Migration20251225182641305];
  }
}
