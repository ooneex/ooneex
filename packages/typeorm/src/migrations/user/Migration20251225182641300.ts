import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225182641298 } from "./Migration20251225182641298";

@decorator.migration()
export class Migration20251225182641300 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TYPE account_type AS ENUM ('oauth', 'email', 'credentials', 'webauthn')
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(25) PRIMARY KEY,
        provider VARCHAR(100),
        provider_account_id VARCHAR(255),
        type account_type NOT NULL,
        password VARCHAR(255),
        access_token TEXT,
        access_token_expires_at TIMESTAMPTZ,
        refresh_token TEXT,
        refresh_token_expires_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        token_type VARCHAR(50),
        scope TEXT,
        id_token TEXT,
        session_state VARCHAR(255),
        email VARCHAR(255),
        email_verified BOOLEAN DEFAULT false,
        name VARCHAR(255),
        picture VARCHAR(500),
        profile JSONB,
        user_id VARCHAR(25),
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
        CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_provider_account_id ON accounts(provider_account_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_expires_at ON accounts(expires_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_language ON accounts(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_is_public ON accounts(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_provider_unique ON accounts(provider, provider_account_id) WHERE deleted_at IS NULL
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS accounts CASCADE`;
    await tx`DROP TYPE IF EXISTS account_type CASCADE`;
  }

  public getVersion(): string {
    return "20251225182641300";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225182641298, // Users table
    ];
  }
}
