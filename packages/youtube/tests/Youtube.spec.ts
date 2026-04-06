import { describe, expect, test } from "bun:test";
import { Youtube, YoutubeException } from "@/index";

describe("Youtube", () => {
  describe("instance creation", () => {
    test("should create Youtube instance with apiKey", () => {
      const instance = new Youtube("test-api-key");
      expect(instance).toBeInstanceOf(Youtube);
    });

    test("should throw YoutubeException when apiKey is not provided", () => {
      expect(() => new Youtube()).toThrow(YoutubeException);
    });

    test("should have all required static methods", () => {
      expect(typeof Youtube.getWatchId).toBe("function");
      expect(typeof Youtube.getEmbedUrl).toBe("function");
      expect(typeof Youtube.getWatchUrl).toBe("function");
    });
  });

  describe("getWatchId", () => {
    test("should extract video ID from standard watch URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from short URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from embed URL", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from /v/ URL", () => {
      const url = "https://www.youtube.com/v/dQw4w9WgXcQ";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from shorts URL", () => {
      const url = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID from URL with additional parameters", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLtest&index=1";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should extract video ID when v parameter is not first", () => {
      const url = "https://www.youtube.com/watch?list=PLtest&v=dQw4w9WgXcQ&index=1";
      expect(Youtube.getWatchId(url)).toBe("dQw4w9WgXcQ");
    });

    test("should return null for invalid URL", () => {
      const url = "https://example.com/video";
      expect(Youtube.getWatchId(url)).toBeNull();
    });

    test("should return null for empty string", () => {
      expect(Youtube.getWatchId("")).toBeNull();
    });

    test("should return null for playlist-only URL", () => {
      const url = "https://www.youtube.com/playlist?list=PLtest";
      expect(Youtube.getWatchId(url)).toBeNull();
    });
  });

  describe("getEmbedUrl", () => {
    test("should convert watch URL to embed URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(Youtube.getEmbedUrl(url)).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    test("should convert short URL to embed URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(Youtube.getEmbedUrl(url)).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    test("should handle video ID directly", () => {
      const videoId = "dQw4w9WgXcQ";
      expect(Youtube.getEmbedUrl(videoId)).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    test("should return null for invalid video ID", () => {
      expect(Youtube.getEmbedUrl("invalid")).toBeNull();
    });

    test("should return null for too short ID", () => {
      expect(Youtube.getEmbedUrl("abc")).toBeNull();
    });

    test("should return null for too long ID", () => {
      expect(Youtube.getEmbedUrl("abcdefghijklmnop")).toBeNull();
    });

    test("should handle ID with hyphen", () => {
      const videoId = "abc-def_123";
      expect(Youtube.getEmbedUrl(videoId)).toBe("https://www.youtube.com/embed/abc-def_123");
    });

    test("should handle ID with underscore", () => {
      const videoId = "abc_def-123";
      expect(Youtube.getEmbedUrl(videoId)).toBe("https://www.youtube.com/embed/abc_def-123");
    });
  });

  describe("getWatchUrl", () => {
    test("should convert embed URL to watch URL", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      expect(Youtube.getWatchUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("should convert short URL to watch URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ";
      expect(Youtube.getWatchUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("should handle video ID directly", () => {
      const videoId = "dQw4w9WgXcQ";
      expect(Youtube.getWatchUrl(videoId)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    test("should return null for invalid video ID", () => {
      expect(Youtube.getWatchUrl("invalid")).toBeNull();
    });

    test("should return null for too short ID", () => {
      expect(Youtube.getWatchUrl("abc")).toBeNull();
    });

    test("should return null for too long ID", () => {
      expect(Youtube.getWatchUrl("abcdefghijklmnop")).toBeNull();
    });

    test("should handle ID with special characters", () => {
      const videoId = "abc-def_123";
      expect(Youtube.getWatchUrl(videoId)).toBe("https://www.youtube.com/watch?v=abc-def_123");
    });

    test("should return same URL format when given watch URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      expect(Youtube.getWatchUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });
});
