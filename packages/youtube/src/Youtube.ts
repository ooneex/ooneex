import { YtDlp } from "ytdlp-nodejs";
import type {
  IYoutube,
  YoutubeFormatKeyWordType,
  YoutubeFormatOptionsType,
  YoutubePlaylistInfoType,
  YoutubeVideoInfoType,
} from "./types";
import { YoutubeException } from "./YoutubeException";

/**
 * YouTube client for downloading and extracting information from YouTube videos and playlists.
 * Wraps yt-dlp functionality with a clean async API and proper error handling.
 *
 * @example Basic Usage
 * ```typescript
 * import { Youtube } from "@ooneex/youtube";
 *
 * const youtube = new Youtube();
 *
 * // Get video information
 * const info = await youtube.getVideoInfo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
 * console.log(info.title, info.duration);
 *
 * // Download a video
 * const filePath = await youtube.download("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
 * console.log(`Downloaded to: ${filePath}`);
 * ```
 *
 * @example Download with Quality Options
 * ```typescript
 * const youtube = new Youtube();
 *
 * // Download video in 1080p
 * const path = await youtube.download(url, {
 *   format: { video: "1080p" },
 * });
 *
 * // Download audio only
 * const audioPath = await youtube.download(url, {
 *   format: { audio: "highest" },
 * });
 * ```
 */
export class Youtube implements IYoutube {
  private readonly ytdlp: YtDlp;

  /**
   * Creates a new YouTube client instance.
   *
   * @example
   * ```typescript
   * const youtube = new Youtube();
   * ```
   */
  constructor() {
    this.ytdlp = new YtDlp();
  }

  /**
   * Retrieves detailed metadata for a YouTube video.
   *
   * @param url - The YouTube video URL
   * @returns Promise resolving to video information including title, description,
   *          duration, view count, available formats, and more
   * @throws {YoutubeException} If the video cannot be accessed or URL is invalid
   *
   * @example
   * ```typescript
   * const youtube = new Youtube();
   * const info = await youtube.getVideoInfo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
   *
   * console.log("Title:", info.title);
   * console.log("Duration:", info.duration, "seconds");
   * console.log("Views:", info.view_count);
   * console.log("Description:", info.description);
   * console.log("Available formats:", info.formats.length);
   * ```
   */
  public async getVideoInfo(url: string): Promise<YoutubeVideoInfoType> {
    try {
      return await this.ytdlp.getInfoAsync<"video">(url);
    } catch (error) {
      throw new YoutubeException(`Failed to get video info: ${(error as Error).message}`, {
        data: { url },
      });
    }
  }

  /**
   * Retrieves information about a YouTube playlist including all videos.
   *
   * @param url - The YouTube playlist URL
   * @returns Promise resolving to playlist metadata and video entries
   * @throws {YoutubeException} If the playlist cannot be accessed or URL is invalid
   *
   * @example
   * ```typescript
   * const youtube = new Youtube();
   * const playlist = await youtube.getPlaylistInfo(
   *   "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
   * );
   *
   * console.log("Playlist:", playlist.title);
   * console.log("Video count:", playlist.entries.length);
   *
   * // Iterate over videos in the playlist
   * for (const video of playlist.entries) {
   *   console.log(`- ${video.title} (${video.duration}s)`);
   * }
   * ```
   */
  public async getPlaylistInfo(url: string): Promise<YoutubePlaylistInfoType> {
    try {
      return await this.ytdlp.getInfoAsync<"playlist">(url);
    } catch (error) {
      throw new YoutubeException(`Failed to get playlist info: ${(error as Error).message}`, {
        data: { url },
      });
    }
  }

  /**
   * Downloads a video to the local filesystem.
   *
   * @typeParam F - The format keyword type (video, audio, or videoandaudio)
   * @param url - The YouTube video URL
   * @param options - Optional format and quality settings
   * @returns Promise resolving to the path of the downloaded file
   * @throws {YoutubeException} If download fails
   *
   * @example Download with Default Settings
   * ```typescript
   * const youtube = new Youtube();
   * const filePath = await youtube.download("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
   * console.log("Downloaded to:", filePath);
   * ```
   *
   * @example Download with Specific Quality
   * ```typescript
   * const youtube = new Youtube();
   *
   * // Download 1080p video
   * const videoPath = await youtube.download(url, {
   *   format: { video: "1080p" },
   * });
   *
   * // Download 720p video with audio
   * const hdPath = await youtube.download(url, {
   *   format: { videoandaudio: "720p" },
   * });
   * ```
   *
   * @example Download Audio Only
   * ```typescript
   * const youtube = new Youtube();
   * const audioPath = await youtube.download(url, {
   *   format: { audio: "highest" },
   * });
   * ```
   */
  public async download(url: string, destination: string): Promise<string> {
    try {
      return await this.ytdlp.downloadAsync(this.getWatchId(url) || "", {
        format: { filter: "audioandvideo", type: "mp4" },
        output: destination,
      });
    } catch (error) {
      throw new YoutubeException(`Failed to download video: ${(error as Error).message}`, {
        data: { url },
      });
    }
  }

  /**
   * Downloads only the audio from a YouTube video.
   * Convenience method that wraps download with audio-only format settings.
   *
   * @param url - The YouTube video URL
   * @param quality - Audio quality preference (defaults to "highest")
   * @returns Promise resolving to the path of the downloaded audio file
   * @throws {YoutubeException} If download fails
   *
   * @example Basic Usage
   * ```typescript
   * const youtube = new Youtube();
   * const audioPath = await youtube.downloadAudio("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
   * console.log("Audio downloaded to:", audioPath);
   * ```
   *
   * @example With Quality Option
   * ```typescript
   * const youtube = new Youtube();
   *
   * // Download highest quality audio
   * const hqPath = await youtube.downloadAudio(url, "highest");
   *
   * // Download lowest quality (smaller file)
   * const lqPath = await youtube.downloadAudio(url, "lowest");
   * ```
   */
  public async downloadAudio(url: string, destination: string): Promise<string> {
    try {
      return await this.ytdlp.downloadAsync(this.getWatchId(url) || "", {
        format: { filter: "audioonly", type: "mp3" },
        output: destination,
      });
    } catch (error) {
      throw new YoutubeException(`Failed to download audio: ${(error as Error).message}`, {
        data: { url },
      });
    }
  }

  /**
   * Downloads a video and returns it as a File object.
   * Useful for in-memory processing or streaming without saving to disk.
   *
   * @typeParam F - The format keyword type (video, audio, or videoandaudio)
   * @param url - The YouTube video URL
   * @param options - Optional filename and format settings
   * @returns Promise resolving to a File object containing the video data
   * @throws {YoutubeException} If download fails
   *
   * @example Basic Usage
   * ```typescript
   * const youtube = new Youtube();
   * const file = await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
   *
   * console.log("File name:", file.name);
   * console.log("File size:", file.size, "bytes");
   * console.log("MIME type:", file.type);
   * ```
   *
   * @example With Custom Filename
   * ```typescript
   * const youtube = new Youtube();
   * const file = await youtube.getFile(url, {
   *   filename: "my-video.mp4",
   * });
   * ```
   *
   * @example With Format Options
   * ```typescript
   * const youtube = new Youtube();
   * const audioFile = await youtube.getFile(url, {
   *   filename: "audio.mp3",
   *   format: { audio: "highest" },
   * });
   * ```
   */
  public async getFile<F extends YoutubeFormatKeyWordType>(
    url: string,
    options?: { filename?: string; format?: YoutubeFormatOptionsType<F>["format"] | undefined },
  ): Promise<File> {
    try {
      const fileOptions = options ? { filename: options.filename, format: options.format } : undefined;
      return await this.ytdlp.getFileAsync(
        this.getWatchId(url) || "",
        fileOptions as Parameters<typeof this.ytdlp.getFileAsync<F>>[1],
      );
    } catch (error) {
      throw new YoutubeException(`Failed to get file: ${(error as Error).message}`, {
        data: { url },
      });
    }
  }

  public getWatchId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  }

  public getEmbedUrl(urlOrId: string): string | null {
    const videoId = this.getWatchId(urlOrId) ?? urlOrId;

    // Validate that it looks like a YouTube video ID (typically 11 characters, alphanumeric with - and _)
    if (!/^[\w-]{10,12}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  }

  public getWatchUrl(urlOrId: string): string | null {
    const videoId = this.getWatchId(urlOrId) ?? urlOrId;

    // Validate that it looks like a YouTube video ID (typically 11 characters, alphanumeric with - and _)
    if (!/^[\w-]{10,12}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
