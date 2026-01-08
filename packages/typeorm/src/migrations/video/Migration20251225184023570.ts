import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";

@decorator.migration()
export class Migration20251225184023570 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`CREATE TYPE video_resolution AS ENUM ('144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', '4320p')`;
    await tx`CREATE TYPE video_quality AS ENUM ('low', 'medium', 'high', 'ultra')`;
    await tx`CREATE TYPE video_format AS ENUM ('mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv')`;
    await tx`CREATE TYPE video_codec AS ENUM ('h264', 'h265', 'vp8', 'vp9', 'av1')`;

    await tx`
      CREATE TABLE IF NOT EXISTS videos (
        id VARCHAR(25) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        subtitle VARCHAR(500),
        release_date DATE,
        description TEXT,
        duration INTEGER,
        category_id VARCHAR(25),
        genres JSONB,
        size BIGINT,
        url TEXT,
        poster_image TEXT,
        thumbnail_image TEXT,
        resolution video_resolution,
        quality video_quality,
        format video_format,
        codec video_codec,
        bitrate INTEGER,
        frame_rate DECIMAL(5, 2),
        audio_codec VARCHAR(50),
        audio_channels VARCHAR(20),
        average_rating DECIMAL(3, 2),
        ratings_count INTEGER,
        content_rating VARCHAR(10),
        context VARCHAR(255),
        context_id VARCHAR(25),
        is_youtube BOOLEAN DEFAULT false,
        status_id VARCHAR(25),
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
        CONSTRAINT fk_videos_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        CONSTRAINT fk_videos_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS videos_tags (
        video_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (video_id, tag_id),
        CONSTRAINT fk_videos_tags_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        CONSTRAINT fk_videos_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_status_id ON videos(status_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_resolution ON videos(resolution)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_quality ON videos(quality)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_format ON videos(format)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_is_youtube ON videos(is_youtube)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_context ON videos(context, context_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_deleted_at ON videos(deleted_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_tags_video_id ON videos_tags(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_videos_tags_tag_id ON videos_tags(tag_id)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS videos_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS videos CASCADE`;
    await tx`DROP TYPE IF EXISTS video_codec CASCADE`;
    await tx`DROP TYPE IF EXISTS video_format CASCADE`;
    await tx`DROP TYPE IF EXISTS video_quality CASCADE`;
    await tx`DROP TYPE IF EXISTS video_resolution CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023570";
  }

  public getDependencies(): MigrationClassType[] {
    return [];
  }
}
