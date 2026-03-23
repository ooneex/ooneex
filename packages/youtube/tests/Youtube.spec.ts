import { beforeEach, describe, expect, test } from "bun:test";
import { Youtube } from "@/index";

describe("Youtube", () => {
  let youtube: Youtube;

  beforeEach(() => {
    youtube = new Youtube();
  });

  describe("instance creation", () => {
    test("should create Youtube instance", () => {
      const instance = new Youtube();
      expect(instance).toBeInstanceOf(Youtube);
    });

    test("should have all required methods", () => {
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

});
