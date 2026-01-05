/**
 * @fileoverview Type definitions for the YouTube package.
 * Provides type aliases and interfaces for working with YouTube videos and playlists.
 *
 * @example
 * ```typescript
 * import type {
 *   YoutubeVideoInfoType,
 *   YoutubeVideoQualityType,
 * } from "@ooneex/youtube";
 *
 * const quality: YoutubeVideoQualityType = "1080p";
 * ```
 */

import type {
  ArgsOptions,
  FormatOptions,
  PlaylistInfo,
  QualityOptions,
  VideoFormat,
  VideoInfo,
  VideoProgress,
} from "ytdlp-nodejs";

/**
 * Video information returned from YouTube.
 * Contains metadata such as title, description, duration, view count, etc.
 *
 * @example
 * ```typescript
 * const info: YoutubeVideoInfoType = await youtube.getVideoInfo(url);
 * console.log(info.title, info.duration, info.view_count);
 * ```
 */
export type YoutubeVideoInfoType = VideoInfo;

/**
 * Playlist information returned from YouTube.
 * Contains playlist metadata and list of videos in the playlist.
 *
 * @example
 * ```typescript
 * const playlist: YoutubePlaylistInfoType = await youtube.getPlaylistInfo(url);
 * console.log(playlist.title, playlist.entries.length);
 * ```
 */
export type YoutubePlaylistInfoType = PlaylistInfo;

/**
 * Video format information including codec, resolution, and bitrate details.
 *
 * @example
 * ```typescript
 * const info = await youtube.getVideoInfo(url);
 * const formats: YoutubeVideoFormatType[] = info.formats;
 * formats.forEach(f => console.log(f.format_id, f.ext, f.resolution));
 * ```
 */
export type YoutubeVideoFormatType = VideoFormat;

/**
 * Download progress information for tracking video download status.
 *
 * @example
 * ```typescript
 * const progress: YoutubeVideoProgressType = {
 *   percent: 50,
 *   totalSize: "100MB",
 *   currentSpeed: "5MB/s",
 *   eta: "10s",
 * };
 * ```
 */
export type YoutubeVideoProgressType = VideoProgress;

/**
 * Additional arguments options for yt-dlp commands.
 *
 * @example
 * ```typescript
 * const args: YoutubeArgsOptionsType = {
 *   noPlaylist: true,
 *   extractAudio: true,
 * };
 * ```
 */
export type YoutubeArgsOptionsType = ArgsOptions;

/**
 * Format options for downloading videos with specific quality settings.
 *
 * @typeParam F - The format keyword type (e.g., "video", "audio", "videoandaudio")
 *
 * @example
 * ```typescript
 * const options: YoutubeFormatOptionsType<"video"> = {
 *   format: { quality: "1080p" },
 * };
 * ```
 */
export type YoutubeFormatOptionsType<F extends YoutubeFormatKeyWordType> = FormatOptions<F>;

/**
 * Quality options for specifying video/audio quality preferences.
 *
 * @example
 * ```typescript
 * const quality: YoutubeQualityOptionsType = {
 *   video: "1080p",
 *   audio: "highest",
 * };
 * ```
 */
export type YoutubeQualityOptionsType = QualityOptions;

/**
 * Format keyword type for specifying download format categories.
 * Can be "video", "audio", or "videoandaudio".
 *
 * @example
 * ```typescript
 * const format: YoutubeFormatKeyWordType = "videoandaudio";
 * ```
 */
export type YoutubeFormatKeyWordType = keyof QualityOptions;

/**
 * Video quality presets for download operations.
 *
 * @example
 * ```typescript
 * const quality: YoutubeVideoQualityType = "1080p";
 *
 * // Available options:
 * // - "2160p" (4K)
 * // - "1440p" (2K)
 * // - "1080p" (Full HD)
 * // - "720p" (HD)
 * // - "480p" (SD)
 * // - "360p", "240p", "144p" (Low quality)
 * // - "highest" (Best available)
 * // - "lowest" (Smallest file size)
 * ```
 */
export type YoutubeVideoQualityType =
  | "2160p"
  | "1440p"
  | "1080p"
  | "720p"
  | "480p"
  | "360p"
  | "240p"
  | "144p"
  | "highest"
  | "lowest";

/**
 * Audio quality presets for audio download operations.
 *
 * @example
 * ```typescript
 * const quality: YoutubeAudioQualityType = "highest";
 *
 * // Available options:
 * // - "highest" (Best available audio quality)
 * // - "lowest" (Smallest file size)
 * ```
 */
export type YoutubeAudioQualityType = "highest" | "lowest";

/**
 * Configuration options for the YouTube client.
 *
 * @example
 * ```typescript
 * const options: YoutubeOptionsType = {
 *   binaryPath: "/usr/local/bin/yt-dlp",
 *   ffmpegPath: "/usr/local/bin/ffmpeg",
 * };
 * const youtube = new Youtube(options);
 * ```
 */
export type YoutubeOptionsType = {
  /**
   * Path to the yt-dlp binary.
   * Falls back to YOUTUBE_YTDLP_PATH environment variable if not provided.
   */
  binaryPath?: string;

  /**
   * Path to the ffmpeg binary.
   * Falls back to YOUTUBE_FFMPEG_PATH environment variable if not provided.
   */
  ffmpegPath?: string;
};

/**
 * Interface defining the YouTube client API.
 * Provides methods for fetching video info, downloading, and managing media.
 *
 * @example
 * ```typescript
 * class MyYoutubeClient implements IYoutube {
 *   async getVideoInfo(url: string) { ... }
 *   async getPlaylistInfo(url: string) { ... }
 *   // ... implement all methods
 * }
 * ```
 */
export interface IYoutube {
  /**
   * Retrieves detailed information about a YouTube video.
   * @param url - The YouTube video URL
   * @returns Promise resolving to video metadata
   */
  getVideoInfo(url: string): Promise<YoutubeVideoInfoType>;

  /**
   * Retrieves information about a YouTube playlist.
   * @param url - The YouTube playlist URL
   * @returns Promise resolving to playlist metadata
   */
  getPlaylistInfo(url: string): Promise<YoutubePlaylistInfoType>;

  /**
   * Downloads a video to the local filesystem.
   * @param url - The YouTube video URL
   * @param destination - The destination path for the downloaded file
   * @returns Promise resolving to the downloaded file path
   */
  download(url: string, destination: string): Promise<string>;

  /**
   * Downloads a video and returns it as a File object.
   * @param url - The YouTube video URL
   * @param options - Optional filename and format settings
   * @returns Promise resolving to a File object
   */
  getFile<F extends YoutubeFormatKeyWordType>(
    url: string,
    options?: { filename?: string; format?: YoutubeFormatOptionsType<F>["format"] },
  ): Promise<File>;

  /**
   * Extracts the video ID (watch ID) from a YouTube URL.
   * @param url - The YouTube video URL
   * @returns The video ID or null if not found
   */
  getWatchId(url: string): string | null;

  /**
   * Generates an embed URL for a YouTube video.
   * @param urlOrId - The YouTube video URL or video ID
   * @returns The embed URL or null if the video ID cannot be extracted
   */
  getEmbedUrl(urlOrId: string): string | null;

  /**
   * Generates a standard watch URL for a YouTube video.
   * @param urlOrId - The YouTube video URL or video ID
   * @returns The watch URL or null if the video ID cannot be extracted
   */
  getWatchUrl(urlOrId: string): string | null;

  /**
   * Downloads only the audio from a YouTube video.
   * @param url - The YouTube video URL
   * @param destination - The destination path for the downloaded audio file
   * @returns Promise resolving to the downloaded audio file path
   */
  downloadAudio(url: string, destination: string): Promise<string>;
}
