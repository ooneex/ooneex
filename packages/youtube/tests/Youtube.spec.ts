import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PlaylistInfo, VideoInfo } from "ytdlp-nodejs";
import { Youtube, YoutubeException } from "@/index";

// biome-ignore lint/suspicious/noExplicitAny: Mock requires flexible typing
const mockGetInfoAsync = mock((): any => Promise.resolve({ title: "Test Video" }));
// biome-ignore lint/suspicious/noExplicitAny: Mock requires flexible typing
const mockDownloadAsync = mock((): any => Promise.resolve("/path/to/video.mp4"));
// biome-ignore lint/suspicious/noExplicitAny: Mock requires flexible typing
const mockGetFileAsync = mock((): any => Promise.resolve(new File(["content"], "video.mp4")));

mock.module("ytdlp-nodejs", () => ({
  YtDlp: class MockYtDlp {
    getInfoAsync = mockGetInfoAsync;
    downloadAsync = mockDownloadAsync;
    getFileAsync = mockGetFileAsync;
  },
}));

const mockOptions = {
  binaryPath: "/mock/path/to/yt-dlp",
  ffmpegPath: "/mock/path/to/ffmpeg",
};

describe("Youtube", () => {
  let youtube: Youtube;

  beforeEach(() => {
    youtube = new Youtube(mockOptions);
    mockGetInfoAsync.mockClear();
    mockDownloadAsync.mockClear();
    mockGetFileAsync.mockClear();
    mockGetInfoAsync.mockImplementation(() => Promise.resolve({ title: "Test Video" }));
    mockDownloadAsync.mockImplementation(() => Promise.resolve("/path/to/video.mp4"));
    mockGetFileAsync.mockImplementation(() => Promise.resolve(new File(["content"], "video.mp4")));
  });

  describe("instance creation", () => {
    test("should create Youtube instance", () => {
      const instance = new Youtube(mockOptions);
      expect(instance).toBeInstanceOf(Youtube);
    });

    test("should have all required methods", () => {
      expect(typeof youtube.getVideoInfo).toBe("function");
      expect(typeof youtube.getPlaylistInfo).toBe("function");
      expect(typeof youtube.download).toBe("function");
      expect(typeof youtube.downloadAudio).toBe("function");
      expect(typeof youtube.getFile).toBe("function");
      expect(typeof youtube.getWatchId).toBe("function");
      expect(typeof youtube.getEmbedUrl).toBe("function");
      expect(typeof youtube.getWatchUrl).toBe("function");
    });
  });

  describe("getWatchId", () => {
    test("should extract video ID from standard watch URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from short URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from embed URL", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from /v/ URL", () => {
      const url = "https://www.youtube.com/v/dQw4w9WgXcQ";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from shorts URL", () => {
      const url = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from URL with additional parameters", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLtest&index=1";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID when v parameter is not first", () => {
      const url = "https://www.youtube.com/watch?list=PLtest&v=dQw4w9WgXcQ&index=1";
      expect(youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should return null for invalid URL", () => {
      const url = "https://example.com/video";
      expect(youtube.getWatchId(url)).toBeNull();
    });

    test("should return null for empty string", () => {
      expect(youtube.getWatchId("")).toBeNull();
    });

    test("should return null for playlist-only URL", () => {
      const url = "https://www.youtube.com/playlist?list=PLtest";
      expect(youtube.getWatchId(url)).toBeNull();
    });
  });

  describe("getEmbedUrl", () => {
    test("should convert watch URL to embed URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(youtube.getEmbedUrl(url)).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    test("should convert short URL to embed URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(youtube.getEmbedUrl(url)).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    test("should handle video ID directly", () => {
      const videoId = "dQw4w9WgXcQ";
      expect(youtube.getEmbedUrl(videoId)).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    test("should return null for invalid video ID", () => {
      expect(youtube.getEmbedUrl("invalid")).toBeNull();
    });

    test("should return null for too short ID", () => {
      expect(youtube.getEmbedUrl("abc")).toBeNull();
    });

    test("should return null for too long ID", () => {
      expect(youtube.getEmbedUrl("abcdefghijklmnop")).toBeNull();
    });

    test("should handle ID with hyphen", () => {
      const videoId = "abc-def_123";
      expect(youtube.getEmbedUrl(videoId)).toBe("https://www.youtube.com/embed/abc-def_123");
    });

    test("should handle ID with underscore", () => {
      const videoId = "abc_def-123";
      expect(youtube.getEmbedUrl(videoId)).toBe("https://www.youtube.com/embed/abc_def-123");
    });
  });

  describe("getWatchUrl", () => {
    test("should convert embed URL to watch URL", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(youtube.getWatchUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("should convert short URL to watch URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(youtube.getWatchUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("should handle video ID directly", () => {
      const videoId = "dQw4w9WgXcQ";
      expect(youtube.getWatchUrl(videoId)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("should return null for invalid video ID", () => {
      expect(youtube.getWatchUrl("invalid")).toBeNull();
    });

    test("should return null for too short ID", () => {
      expect(youtube.getWatchUrl("abc")).toBeNull();
    });

    test("should return null for too long ID", () => {
      expect(youtube.getWatchUrl("abcdefghijklmnop")).toBeNull();
    });

    test("should handle ID with special characters", () => {
      const videoId = "abc-def_123";
      expect(youtube.getWatchUrl(videoId)).toBe("https://www.youtube.com/watch?v=abc-def_123");
    });

    test("should return same URL format when given watch URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(youtube.getWatchUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("getVideoInfo", () => {
    test("should return video information", async () => {
      const mockInfo = {
        title: "Test Video",
        duration: 180,
        view_count: 1000000,
      } as VideoInfo;
      mockGetInfoAsync.mockImplementation(() => Promise.resolve(mockInfo));

      const result = await youtube.getVideoInfo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      expect(result).toEqual(mockInfo);
      expect(mockGetInfoAsync).toHaveBeenCalledTimes(1);
    });

    test("should call ytdlp with correct URL", async () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      await youtube.getVideoInfo(url);

      expect(mockGetInfoAsync).toHaveBeenCalledWith(url);
    });

    test("should throw YoutubeException on error", async () => {
      mockGetInfoAsync.mockImplementation(() => Promise.reject(new Error("Video not found")));

      expect(youtube.getVideoInfo("https://www.youtube.com/watch?v=invalid")).rejects.toBeInstanceOf(YoutubeException);
    });

    test("should include URL in exception data", async () => {
      const url = "https://www.youtube.com/watch?v=invalid";
      mockGetInfoAsync.mockImplementation(() => Promise.reject(new Error("Video not found")));

      try {
        await youtube.getVideoInfo(url);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(YoutubeException);
        expect((error as YoutubeException).message).toContain("Failed to get video info");
        expect((error as YoutubeException).message).toContain("Video not found");
      }
    });
  });

  describe("getPlaylistInfo", () => {
    test("should return playlist information", async () => {
      const mockPlaylist = {
        title: "Test Playlist",
        entries: [{ title: "Video 1" }, { title: "Video 2" }],
      } as unknown as PlaylistInfo;
      mockGetInfoAsync.mockImplementation(() => Promise.resolve(mockPlaylist));

      const result = await youtube.getPlaylistInfo("https://www.youtube.com/playlist?list=PLtest");

      expect(result).toEqual(mockPlaylist);
      expect(mockGetInfoAsync).toHaveBeenCalledTimes(1);
    });

    test("should call ytdlp with correct URL", async () => {
      const url = "https://www.youtube.com/playlist?list=PLtest";
      await youtube.getPlaylistInfo(url);

      expect(mockGetInfoAsync).toHaveBeenCalledWith(url);
    });

    test("should throw YoutubeException on error", async () => {
      mockGetInfoAsync.mockImplementation(() => Promise.reject(new Error("Playlist not found")));

      expect(youtube.getPlaylistInfo("https://www.youtube.com/playlist?list=invalid")).rejects.toBeInstanceOf(
        YoutubeException,
      );
    });

    test("should include descriptive error message", async () => {
      mockGetInfoAsync.mockImplementation(() => Promise.reject(new Error("Playlist not found")));

      try {
        await youtube.getPlaylistInfo("https://www.youtube.com/playlist?list=invalid");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(YoutubeException);
        expect((error as YoutubeException).message).toContain("Failed to get playlist info");
      }
    });
  });

  describe("download", () => {
    test("should return file path on successful download", async () => {
      const result = await youtube.download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/output/video.mp4");

      expect(result).toBe("/path/to/video.mp4");
      expect(mockDownloadAsync).toHaveBeenCalledTimes(1);
    });

    test("should extract video ID and pass destination to ytdlp", async () => {
      const destination = "/output/video.mp4";
      await youtube.download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", destination);

      expect(mockDownloadAsync).toHaveBeenCalledWith("dQw4w9WgXcQ", {
        format: { filter: "audioandvideo", type: "mp4" },
        output: destination,
      });
    });

    test("should throw YoutubeException on error", async () => {
      mockDownloadAsync.mockImplementation(() => Promise.reject(new Error("Download failed")));

      expect(
        youtube.download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/output/video.mp4"),
      ).rejects.toBeInstanceOf(YoutubeException);
    });

    test("should include descriptive error message", async () => {
      mockDownloadAsync.mockImplementation(() => Promise.reject(new Error("Download failed")));

      try {
        await youtube.download("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/output/video.mp4");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(YoutubeException);
        expect((error as YoutubeException).message).toContain("Failed to download video");
      }
    });

    test("should handle URL without valid video ID", async () => {
      await youtube.download("https://example.com/invalid", "/output/video.mp4");

      expect(mockDownloadAsync).toHaveBeenCalledWith("", {
        format: { filter: "audioandvideo", type: "mp4" },
        output: "/output/video.mp4",
      });
    });
  });

  describe("getFile", () => {
    test("should return File object on success", async () => {
      const mockFile = new File(["content"], "video.mp4", { type: "video/mp4" });
      mockGetFileAsync.mockImplementation(() => Promise.resolve(mockFile));

      const result = await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe("video.mp4");
    });

    test("should extract video ID and pass to ytdlp", async () => {
      await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

      expect(mockGetFileAsync).toHaveBeenCalledWith("dQw4w9WgXcQ", undefined);
    });

    test("should pass filename option to ytdlp", async () => {
      await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
        filename: "custom-name.mp4",
      });

      expect(mockGetFileAsync).toHaveBeenCalledWith("dQw4w9WgXcQ", {
        filename: "custom-name.mp4",
        format: undefined,
      });
    });

    test("should pass format option to ytdlp", async () => {
      await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
        format: { filter: "audioonly", quality: 10 },
      });

      expect(mockGetFileAsync).toHaveBeenCalledWith("dQw4w9WgXcQ", {
        filename: undefined,
        format: { filter: "audioonly", quality: 10 },
      });
    });

    test("should pass both filename and format options", async () => {
      await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ", {
        filename: "audio.mp3",
        format: { filter: "audioonly", quality: 10 },
      });

      expect(mockGetFileAsync).toHaveBeenCalledWith("dQw4w9WgXcQ", {
        filename: "audio.mp3",
        format: { filter: "audioonly", quality: 10 },
      });
    });

    test("should throw YoutubeException on error", async () => {
      mockGetFileAsync.mockImplementation(() => Promise.reject(new Error("File fetch failed")));

      expect(youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).rejects.toBeInstanceOf(YoutubeException);
    });

    test("should include descriptive error message", async () => {
      mockGetFileAsync.mockImplementation(() => Promise.reject(new Error("File fetch failed")));

      try {
        await youtube.getFile("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(YoutubeException);
        expect((error as YoutubeException).message).toContain("Failed to get file");
      }
    });
  });

  describe("downloadAudio", () => {
    test("should return file path on successful audio download", async () => {
      mockDownloadAsync.mockImplementation(() => Promise.resolve("/path/to/audio.mp3"));

      const result = await youtube.downloadAudio("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/output/audio.mp3");

      expect(result).toBe("/path/to/audio.mp3");
      expect(mockDownloadAsync).toHaveBeenCalledTimes(1);
    });

    test("should extract video ID and pass audio format with destination to ytdlp", async () => {
      const destination = "/output/audio.mp3";
      await youtube.downloadAudio("https://www.youtube.com/watch?v=dQw4w9WgXcQ", destination);

      expect(mockDownloadAsync).toHaveBeenCalledWith("dQw4w9WgXcQ", {
        format: { filter: "audioonly", type: "mp3" },
        output: destination,
      });
    });

    test("should throw YoutubeException on error", async () => {
      mockDownloadAsync.mockImplementation(() => Promise.reject(new Error("Audio download failed")));

      expect(
        youtube.downloadAudio("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/output/audio.mp3"),
      ).rejects.toBeInstanceOf(YoutubeException);
    });

    test("should include descriptive error message", async () => {
      mockDownloadAsync.mockImplementation(() => Promise.reject(new Error("Audio download failed")));

      try {
        await youtube.downloadAudio("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "/output/audio.mp3");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(YoutubeException);
        expect((error as YoutubeException).message).toContain("Failed to download audio");
      }
    });

    test("should handle URL without valid video ID", async () => {
      await youtube.downloadAudio("https://example.com/invalid", "/output/audio.mp3");

      expect(mockDownloadAsync).toHaveBeenCalledWith("", {
        format: { filter: "audioonly", type: "mp3" },
        output: "/output/audio.mp3",
      });
    });
  });
});
