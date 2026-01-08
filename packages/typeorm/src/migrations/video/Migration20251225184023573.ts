import { decorator, type IMigration, type MigrationClassType } from "@ooneex/migrations";
import type { TransactionSQL } from "bun";
import { Migration20251225184023570 } from "./Migration20251225184023570";

@decorator.migration()
export class Migration20251225184023573 implements IMigration {
  public async up(tx: TransactionSQL): Promise<void> {
    await tx`
      CREATE TABLE IF NOT EXISTS video_playlists (
        id VARCHAR(25) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
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
        CONSTRAINT fk_video_playlists_status FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE SET NULL
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS playlists_videos (
        playlist_id VARCHAR(25) NOT NULL,
        video_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (playlist_id, video_id),
        CONSTRAINT fk_playlists_videos_playlist FOREIGN KEY (playlist_id) REFERENCES video_playlists(id) ON DELETE CASCADE,
        CONSTRAINT fk_playlists_videos_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `;

    await tx`
      CREATE TABLE IF NOT EXISTS playlists_tags (
        playlist_id VARCHAR(25) NOT NULL,
        tag_id VARCHAR(25) NOT NULL,
        PRIMARY KEY (playlist_id, tag_id),
        CONSTRAINT fk_playlists_tags_playlist FOREIGN KEY (playlist_id) REFERENCES video_playlists(id) ON DELETE CASCADE,
        CONSTRAINT fk_playlists_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await tx`CREATE INDEX IF NOT EXISTS idx_video_playlists_name ON video_playlists(name)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_playlists_status_id ON video_playlists(status_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_playlists_created_at ON video_playlists(created_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_video_playlists_deleted_at ON video_playlists(deleted_at)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_playlists_videos_playlist_id ON playlists_videos(playlist_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_playlists_videos_video_id ON playlists_videos(video_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_playlists_tags_playlist_id ON playlists_tags(playlist_id)`;
    await tx`CREATE INDEX IF NOT EXISTS idx_playlists_tags_tag_id ON playlists_tags(tag_id)`;
  }

  public async down(tx: TransactionSQL): Promise<void> {
    await tx`DROP TABLE IF EXISTS playlists_tags CASCADE`;
    await tx`DROP TABLE IF EXISTS playlists_videos CASCADE`;
    await tx`DROP TABLE IF EXISTS video_playlists CASCADE`;
  }

  public getVersion(): string {
    return "20251225184023573";
  }

  public getDependencies(): MigrationClassType[] {
    return [Migration20251225184023570];
  }
}
