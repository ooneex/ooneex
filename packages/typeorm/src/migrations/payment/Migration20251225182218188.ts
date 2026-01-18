import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225173351645 } from "../common/Migration20251225173351645";
import { Migration20251225173352645 } from "../common/Migration20251225173352645";
import { Migration20251225181613479 } from "../image/Migration20251225181613479";

@decorator.migration()
export class Migration20251225182218188 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS payment_products (
        id VARCHAR(25) PRIMARY KEY,
        key VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        currency VARCHAR(3),
        price DECIMAL(10, 2),
        barcode VARCHAR(255),
        attributes JSONB,
        is_recurring BOOLEAN,
        is_archived BOOLEAN,
        organization_id VARCHAR(25),
        recurring_interval VARCHAR(20),
        metadata JSONB,
        prices JSONB,
        benefits JSONB,
        attached_custom_fields JSONB,
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMPTZ,
        is_blocked BOOLEAN DEFAULT false,
        blocked_at TIMESTAMPTZ,
        block_reason TEXT,
        is_public BOOLEAN DEFAULT true,
        language VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_products_categories (
        product_id VARCHAR(25) NOT NULL,
        category_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (product_id, category_id),
        CONSTRAINT fk_payment_products_categories_product FOREIGN KEY (product_id) REFERENCES payment_products(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_products_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_products_images (
        product_id VARCHAR(25) NOT NULL,
        image_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (product_id, image_id),
        CONSTRAINT fk_payment_products_images_product FOREIGN KEY (product_id) REFERENCES payment_products(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_products_images_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS payment_products_tags (
        product_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (product_id, tag_id),
        CONSTRAINT fk_payment_products_tags_product FOREIGN KEY (product_id) REFERENCES payment_products(id) ON DELETE CASCADE,
        CONSTRAINT fk_payment_products_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_key ON payment_products(key)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_name ON payment_products(name)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_currency ON payment_products(currency)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_price ON payment_products(price)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_barcode ON payment_products(barcode)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_is_recurring ON payment_products(is_recurring)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_is_archived ON payment_products(is_archived)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_organization_id ON payment_products(organization_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_recurring_interval ON payment_products(recurring_interval)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_language ON payment_products(language)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_deleted_at ON payment_products(deleted_at)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_is_public ON payment_products(is_public) WHERE deleted_at IS NULL
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_created_at ON payment_products(created_at DESC)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_active ON payment_products(is_blocked, is_locked) WHERE deleted_at IS NULL AND is_blocked = false
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_categories_product_id ON payment_products_categories(product_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_categories_category_id ON payment_products_categories(category_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_images_product_id ON payment_products_images(product_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_images_image_id ON payment_products_images(image_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_tags_product_id ON payment_products_tags(product_id)
    `;

    await tx`
      CREATE INDEX IF NOT EXISTS idx_payment_products_tags_tag_id ON payment_products_tags(tag_id)
    `;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS payment_products_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_products_images CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_products_categories CASCADE`;
    await tx`DROP TABLE IF EXISTS payment_products CASCADE`;
  }

  public getVersion(): string {
    return "20251225182218188";
  }

  public getDependencies(): MigrationClassType[] {
    return [
      Migration20251225173352645, // Categories table
      Migration20251225181613479, // Images table
      Migration20251225173351645, // Tags table
    ];
  }
}
