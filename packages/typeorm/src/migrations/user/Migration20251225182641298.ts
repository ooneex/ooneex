import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225181613479 } from "../image/Migration20251225181613479";

@decorator.migration()
export class Migration20251225182641298 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(25) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        roles TEXT NOT NULL,
        name VARCHAR(255),
        last_name VARCHAR(255),
        first_name VARCHAR(255),
        username VARCHAR(100) UNIQUE,
        avatar_id VARCHAR(25),
        bio TEXT,
        phone VARCHAR(20),
        birth_date DATE,
        timezone VARCHAR(50),
        is_email_verified BOOLEAN DEFAULT false,
        is_phone_verified BOOLEAN DEFAULT false,
        last_active_at TIMESTAMPTZ,
        email_verified_at TIMESTAMPTZ,
        phone_verified_at TIMESTAMPTZ,
        last_login_at TIMESTAMPTZ,
        password_changed_at TIMESTAMPTZ,
        two_factor_enabled BOOLEAN DEFAULT false,
        two_factor_secret VARCHAR(255),
        recovery_tokens TEXT,
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
        CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_id) REFERENCES images(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_is_email_verified ON users(is_email_verified)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_is_phone_verified ON users(is_phone_verified)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_language ON users(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_is_public ON users(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS users CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641298";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225181613479, // Images table (for avatar_id foreign key)
    ];
  }
}
