import { beforeEach, describe, expect, test } from "bun:test";
import { Mime } from "@/index.ts";

describe("Mime", () => {
  let mime: Mime;

  beforeEach(() => {
    mime = new Mime();
  });

  describe("isJson", () => {
    test("should return true for application/json", () => {
      expect(mime.isJson("application/json")).toBe(true);
    });

    test("should return true for JSON-based MIME types ending with +json", () => {
      expect(mime.isJson("application/hal+json")).toBe(true);
      expect(mime.isJson("application/ld+json")).toBe(true);
      expect(mime.isJson("application/api+json")).toBe(true);
    });

    test("should return true for JSON-related MIME types", () => {
      expect(mime.isJson("application/json5")).toBe(true);
      expect(mime.isJson("application/jsonml+json")).toBe(true);
      expect(mime.isJson("application/jsonpath")).toBe(true);
      expect(mime.isJson("text/json")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isJson("APPLICATION/JSON")).toBe(true);
      expect(mime.isJson("Application/Json")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isJson(" application/json ")).toBe(true);
      expect(mime.isJson("\t application/json \n")).toBe(true);
    });

    test("should return false for non-JSON MIME types", () => {
      expect(mime.isJson("text/html")).toBe(false);
      expect(mime.isJson("image/png")).toBe(false);
      expect(mime.isJson("application/xml")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isJson("")).toBe(false);
      expect(mime.isJson(" ")).toBe(false);
      expect(mime.isJson(null as unknown as string)).toBe(false);
      expect(mime.isJson(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isAudio", () => {
    test("should return true for audio/* MIME types", () => {
      expect(mime.isAudio("audio/mpeg")).toBe(true);
      expect(mime.isAudio("audio/mp3")).toBe(true);
      expect(mime.isAudio("audio/wav")).toBe(true);
      expect(mime.isAudio("audio/ogg")).toBe(true);
      expect(mime.isAudio("audio/flac")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isAudio("AUDIO/MPEG")).toBe(true);
      expect(mime.isAudio("Audio/Mp3")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isAudio(" audio/mpeg ")).toBe(true);
    });

    test("should return false for non-audio MIME types", () => {
      expect(mime.isAudio("video/mp4")).toBe(false);
      expect(mime.isAudio("image/png")).toBe(false);
      expect(mime.isAudio("text/html")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isAudio("")).toBe(false);
      expect(mime.isAudio(null as unknown as string)).toBe(false);
      expect(mime.isAudio(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isVideo", () => {
    test("should return true for video/* MIME types", () => {
      expect(mime.isVideo("video/mp4")).toBe(true);
      expect(mime.isVideo("video/mpeg")).toBe(true);
      expect(mime.isVideo("video/avi")).toBe(true);
      expect(mime.isVideo("video/webm")).toBe(true);
      expect(mime.isVideo("video/quicktime")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isVideo("VIDEO/MP4")).toBe(true);
      expect(mime.isVideo("Video/Mpeg")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isVideo(" video/mp4 ")).toBe(true);
    });

    test("should return false for non-video MIME types", () => {
      expect(mime.isVideo("audio/mpeg")).toBe(false);
      expect(mime.isVideo("image/png")).toBe(false);
      expect(mime.isVideo("text/html")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isVideo("")).toBe(false);
      expect(mime.isVideo(null as unknown as string)).toBe(false);
      expect(mime.isVideo(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isMp4", () => {
    test("should return true for MP4 MIME types", () => {
      expect(mime.isMp4("video/mp4")).toBe(true);
      expect(mime.isMp4("audio/mp4")).toBe(true);
      expect(mime.isMp4("application/mp4")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isMp4("VIDEO/MP4")).toBe(true);
      expect(mime.isMp4("Audio/Mp4")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isMp4(" video/mp4 ")).toBe(true);
    });

    test("should return false for non-MP4 MIME types", () => {
      expect(mime.isMp4("video/mpeg")).toBe(false);
      expect(mime.isMp4("audio/mpeg")).toBe(false);
      expect(mime.isMp4("video/avi")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isMp4("")).toBe(false);
      expect(mime.isMp4(null as unknown as string)).toBe(false);
      expect(mime.isMp4(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isMp3", () => {
    test("should return true for MP3 MIME types", () => {
      expect(mime.isMp3("audio/mp3")).toBe(true);
      expect(mime.isMp3("audio/mpeg")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isMp3("AUDIO/MP3")).toBe(true);
      expect(mime.isMp3("Audio/Mpeg")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isMp3(" audio/mp3 ")).toBe(true);
    });

    test("should return false for non-MP3 MIME types", () => {
      expect(mime.isMp3("audio/wav")).toBe(false);
      expect(mime.isMp3("video/mp4")).toBe(false);
      expect(mime.isMp3("audio/ogg")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isMp3("")).toBe(false);
      expect(mime.isMp3(null as unknown as string)).toBe(false);
      expect(mime.isMp3(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isSvg", () => {
    test("should return true for SVG MIME types", () => {
      expect(mime.isSvg("image/svg+xml")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isSvg("IMAGE/SVG+XML")).toBe(true);
      expect(mime.isSvg("Image/Svg+Xml")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isSvg(" image/svg+xml ")).toBe(true);
    });

    test("should return false for non-SVG MIME types", () => {
      expect(mime.isSvg("image/png")).toBe(false);
      expect(mime.isSvg("image/jpeg")).toBe(false);
      expect(mime.isSvg("text/xml")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isSvg("")).toBe(false);
      expect(mime.isSvg(null as unknown as string)).toBe(false);
      expect(mime.isSvg(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isJpeg", () => {
    test("should return true for JPEG MIME types", () => {
      expect(mime.isJpeg("image/jpeg")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isJpeg("IMAGE/JPEG")).toBe(true);
      expect(mime.isJpeg("Image/Jpeg")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isJpeg(" image/jpeg ")).toBe(true);
    });

    test("should return false for non-JPEG MIME types", () => {
      expect(mime.isJpeg("image/png")).toBe(false);
      expect(mime.isJpeg("image/jpg")).toBe(false);
      expect(mime.isJpeg("image/gif")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isJpeg("")).toBe(false);
      expect(mime.isJpeg(null as unknown as string)).toBe(false);
      expect(mime.isJpeg(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isCsv", () => {
    test("should return true for CSV MIME types", () => {
      expect(mime.isCsv("text/csv")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isCsv("TEXT/CSV")).toBe(true);
      expect(mime.isCsv("Text/Csv")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isCsv(" text/csv ")).toBe(true);
    });

    test("should return false for non-CSV MIME types", () => {
      expect(mime.isCsv("text/plain")).toBe(false);
      expect(mime.isCsv("application/csv")).toBe(false);
      expect(mime.isCsv("text/html")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isCsv("")).toBe(false);
      expect(mime.isCsv(null as unknown as string)).toBe(false);
      expect(mime.isCsv(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isJpg", () => {
    test("should return true for JPG MIME types", () => {
      expect(mime.isJpg("image/jpeg")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isJpg("IMAGE/JPEG")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isJpg(" image/jpeg ")).toBe(true);
    });

    test("should return false for non-JPG MIME types", () => {
      expect(mime.isJpg("image/png")).toBe(false);
      expect(mime.isJpg("image/gif")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isJpg("")).toBe(false);
      expect(mime.isJpg(null as unknown as string)).toBe(false);
      expect(mime.isJpg(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isPng", () => {
    test("should return true for PNG MIME types", () => {
      expect(mime.isPng("image/png")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isPng("IMAGE/PNG")).toBe(true);
      expect(mime.isPng("Image/Png")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isPng(" image/png ")).toBe(true);
    });

    test("should return false for non-PNG MIME types", () => {
      expect(mime.isPng("image/jpeg")).toBe(false);
      expect(mime.isPng("image/gif")).toBe(false);
      expect(mime.isPng("image/webp")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isPng("")).toBe(false);
      expect(mime.isPng(null as unknown as string)).toBe(false);
      expect(mime.isPng(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isPdf", () => {
    test("should return true for PDF MIME types", () => {
      expect(mime.isPdf("application/pdf")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isPdf("APPLICATION/PDF")).toBe(true);
      expect(mime.isPdf("Application/Pdf")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isPdf(" application/pdf ")).toBe(true);
    });

    test("should return false for non-PDF MIME types", () => {
      expect(mime.isPdf("application/json")).toBe(false);
      expect(mime.isPdf("text/plain")).toBe(false);
      expect(mime.isPdf("image/png")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isPdf("")).toBe(false);
      expect(mime.isPdf(null as unknown as string)).toBe(false);
      expect(mime.isPdf(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isHtml", () => {
    test("should return true for HTML MIME types", () => {
      expect(mime.isHtml("text/html")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isHtml("TEXT/HTML")).toBe(true);
      expect(mime.isHtml("Text/Html")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isHtml(" text/html ")).toBe(true);
    });

    test("should return false for non-HTML MIME types", () => {
      expect(mime.isHtml("text/plain")).toBe(false);
      expect(mime.isHtml("application/xhtml+xml")).toBe(false);
      expect(mime.isHtml("text/xml")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isHtml("")).toBe(false);
      expect(mime.isHtml(null as unknown as string)).toBe(false);
      expect(mime.isHtml(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isCss", () => {
    test("should return true for CSS MIME types", () => {
      expect(mime.isCss("text/css")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isCss("TEXT/CSS")).toBe(true);
      expect(mime.isCss("Text/Css")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isCss(" text/css ")).toBe(true);
    });

    test("should return false for non-CSS MIME types", () => {
      expect(mime.isCss("text/html")).toBe(false);
      expect(mime.isCss("text/plain")).toBe(false);
      expect(mime.isCss("application/css")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isCss("")).toBe(false);
      expect(mime.isCss(null as unknown as string)).toBe(false);
      expect(mime.isCss(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isJavaScript", () => {
    test("should return true for JavaScript MIME types", () => {
      expect(mime.isJavaScript("text/javascript")).toBe(true);
      expect(mime.isJavaScript("application/javascript")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isJavaScript("TEXT/JAVASCRIPT")).toBe(true);
      expect(mime.isJavaScript("Application/Javascript")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isJavaScript(" text/javascript ")).toBe(true);
    });

    test("should return false for non-JavaScript MIME types", () => {
      expect(mime.isJavaScript("text/html")).toBe(false);
      expect(mime.isJavaScript("application/json")).toBe(false);
      expect(mime.isJavaScript("text/css")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isJavaScript("")).toBe(false);
      expect(mime.isJavaScript(null as unknown as string)).toBe(false);
      expect(mime.isJavaScript(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isZip", () => {
    test("should return true for ZIP MIME types", () => {
      expect(mime.isZip("application/zip")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isZip("APPLICATION/ZIP")).toBe(true);
      expect(mime.isZip("Application/Zip")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isZip(" application/zip ")).toBe(true);
    });

    test("should return false for non-ZIP MIME types", () => {
      expect(mime.isZip("application/gzip")).toBe(false);
      expect(mime.isZip("application/x-zip")).toBe(false);
      expect(mime.isZip("application/rar")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isZip("")).toBe(false);
      expect(mime.isZip(null as unknown as string)).toBe(false);
      expect(mime.isZip(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isGif", () => {
    test("should return true for GIF MIME types", () => {
      expect(mime.isGif("image/gif")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isGif("IMAGE/GIF")).toBe(true);
      expect(mime.isGif("Image/Gif")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isGif(" image/gif ")).toBe(true);
    });

    test("should return false for non-GIF MIME types", () => {
      expect(mime.isGif("image/png")).toBe(false);
      expect(mime.isGif("image/jpeg")).toBe(false);
      expect(mime.isGif("image/webp")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isGif("")).toBe(false);
      expect(mime.isGif(null as unknown as string)).toBe(false);
      expect(mime.isGif(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isWebp", () => {
    test("should return true for WebP MIME types", () => {
      expect(mime.isWebp("image/webp")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isWebp("IMAGE/WEBP")).toBe(true);
      expect(mime.isWebp("Image/Webp")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isWebp(" image/webp ")).toBe(true);
    });

    test("should return false for non-WebP MIME types", () => {
      expect(mime.isWebp("image/png")).toBe(false);
      expect(mime.isWebp("image/jpeg")).toBe(false);
      expect(mime.isWebp("image/gif")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isWebp("")).toBe(false);
      expect(mime.isWebp(null as unknown as string)).toBe(false);
      expect(mime.isWebp(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isXml", () => {
    test("should return true for XML MIME types", () => {
      expect(mime.isXml("text/xml")).toBe(true);
      expect(mime.isXml("application/xml")).toBe(true);
    });

    test("should return true for XML-based MIME types ending with +xml", () => {
      expect(mime.isXml("application/rss+xml")).toBe(true);
      expect(mime.isXml("image/svg+xml")).toBe(true);
      expect(mime.isXml("application/atom+xml")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isXml("TEXT/XML")).toBe(true);
      expect(mime.isXml("Application/Xml")).toBe(true);
      expect(mime.isXml("APPLICATION/RSS+XML")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isXml(" text/xml ")).toBe(true);
      expect(mime.isXml(" application/rss+xml ")).toBe(true);
    });

    test("should return false for non-XML MIME types", () => {
      expect(mime.isXml("text/html")).toBe(false);
      expect(mime.isXml("application/json")).toBe(false);
      expect(mime.isXml("text/plain")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isXml("")).toBe(false);
      expect(mime.isXml(null as unknown as string)).toBe(false);
      expect(mime.isXml(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isText", () => {
    test("should return true for text/plain MIME type", () => {
      expect(mime.isText("text/plain")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isText("TEXT/PLAIN")).toBe(true);
      expect(mime.isText("Text/Plain")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isText(" text/plain ")).toBe(true);
    });

    test("should return false for non-text/plain MIME types", () => {
      expect(mime.isText("text/html")).toBe(false);
      expect(mime.isText("text/css")).toBe(false);
      expect(mime.isText("application/json")).toBe(false);
      expect(mime.isText("image/png")).toBe(false);
      expect(mime.isText("video/mp4")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isText("")).toBe(false);
      expect(mime.isText(null as unknown as string)).toBe(false);
      expect(mime.isText(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isOctetStream", () => {
    test("should return true for octet-stream MIME types", () => {
      expect(mime.isOctetStream("application/octet-stream")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isOctetStream("APPLICATION/OCTET-STREAM")).toBe(true);
      expect(mime.isOctetStream("Application/Octet-Stream")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isOctetStream(" application/octet-stream ")).toBe(true);
    });

    test("should return false for non-octet-stream MIME types", () => {
      expect(mime.isOctetStream("application/json")).toBe(false);
      expect(mime.isOctetStream("application/pdf")).toBe(false);
      expect(mime.isOctetStream("text/plain")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isOctetStream("")).toBe(false);
      expect(mime.isOctetStream(null as unknown as string)).toBe(false);
      expect(mime.isOctetStream(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isFont", () => {
    test("should return true for font/* MIME types", () => {
      expect(mime.isFont("font/woff")).toBe(true);
      expect(mime.isFont("font/woff2")).toBe(true);
      expect(mime.isFont("font/ttf")).toBe(true);
      expect(mime.isFont("font/otf")).toBe(true);
    });

    test("should return true for application font MIME types", () => {
      expect(mime.isFont("application/font-woff")).toBe(true);
      expect(mime.isFont("application/font-woff2")).toBe(true);
      expect(mime.isFont("application/font-sfnt")).toBe(true);
      expect(mime.isFont("application/font-tdpfr")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isFont("FONT/WOFF")).toBe(true);
      expect(mime.isFont("Application/Font-Woff")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isFont(" font/woff ")).toBe(true);
    });

    test("should return false for non-font MIME types", () => {
      expect(mime.isFont("text/plain")).toBe(false);
      expect(mime.isFont("image/png")).toBe(false);
      expect(mime.isFont("application/json")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isFont("")).toBe(false);
      expect(mime.isFont(null as unknown as string)).toBe(false);
      expect(mime.isFont(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isWord", () => {
    test("should return true for Word document MIME types", () => {
      expect(mime.isWord("application/msword")).toBe(true);
      expect(mime.isWord("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isWord("APPLICATION/MSWORD")).toBe(true);
      expect(mime.isWord("Application/Msword")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isWord(" application/msword ")).toBe(true);
    });

    test("should return false for non-Word MIME types", () => {
      expect(mime.isWord("application/pdf")).toBe(false);
      expect(mime.isWord("text/plain")).toBe(false);
      expect(mime.isWord("application/json")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isWord("")).toBe(false);
      expect(mime.isWord(null as unknown as string)).toBe(false);
      expect(mime.isWord(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isExcel", () => {
    test("should return true for Excel document MIME types", () => {
      expect(mime.isExcel("application/vnd.ms-excel")).toBe(true);
      expect(mime.isExcel("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isExcel("APPLICATION/VND.MS-EXCEL")).toBe(true);
      expect(mime.isExcel("Application/Vnd.Ms-Excel")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isExcel(" application/vnd.ms-excel ")).toBe(true);
    });

    test("should return false for non-Excel MIME types", () => {
      expect(mime.isExcel("application/msword")).toBe(false);
      expect(mime.isExcel("text/csv")).toBe(false);
      expect(mime.isExcel("application/json")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isExcel("")).toBe(false);
      expect(mime.isExcel(null as unknown as string)).toBe(false);
      expect(mime.isExcel(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isPowerPoint", () => {
    test("should return true for PowerPoint document MIME types", () => {
      expect(mime.isPowerPoint("application/vnd.ms-powerpoint")).toBe(true);
      expect(mime.isPowerPoint("application/vnd.openxmlformats-officedocument.presentationml.presentation")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isPowerPoint("APPLICATION/VND.MS-POWERPOINT")).toBe(true);
      expect(mime.isPowerPoint("Application/Vnd.Ms-Powerpoint")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isPowerPoint(" application/vnd.ms-powerpoint ")).toBe(true);
    });

    test("should return false for non-PowerPoint MIME types", () => {
      expect(mime.isPowerPoint("application/msword")).toBe(false);
      expect(mime.isPowerPoint("application/vnd.ms-excel")).toBe(false);
      expect(mime.isPowerPoint("application/pdf")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isPowerPoint("")).toBe(false);
      expect(mime.isPowerPoint(null as unknown as string)).toBe(false);
      expect(mime.isPowerPoint(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isImage", () => {
    test("should return true for image/* MIME types", () => {
      expect(mime.isImage("image/png")).toBe(true);
      expect(mime.isImage("image/jpeg")).toBe(true);
      expect(mime.isImage("image/gif")).toBe(true);
      expect(mime.isImage("image/webp")).toBe(true);
      expect(mime.isImage("image/svg+xml")).toBe(true);
      expect(mime.isImage("image/bmp")).toBe(true);
      expect(mime.isImage("image/tiff")).toBe(true);
    });

    test("should be case insensitive", () => {
      expect(mime.isImage("IMAGE/PNG")).toBe(true);
      expect(mime.isImage("Image/Jpeg")).toBe(true);
    });

    test("should handle whitespace", () => {
      expect(mime.isImage(" image/png ")).toBe(true);
    });

    test("should return false for non-image MIME types", () => {
      expect(mime.isImage("text/html")).toBe(false);
      expect(mime.isImage("video/mp4")).toBe(false);
      expect(mime.isImage("audio/mpeg")).toBe(false);
      expect(mime.isImage("application/pdf")).toBe(false);
    });

    test("should return false for empty or invalid input", () => {
      expect(mime.isImage("")).toBe(false);
      expect(mime.isImage(null as unknown as string)).toBe(false);
      expect(mime.isImage(undefined as unknown as string)).toBe(false);
    });
  });

  // Integration and edge case tests
  describe("Integration Tests", () => {
    test("should handle multiple MIME type checks in sequence", () => {
      const imageFile = "image/png";
      const audioFile = "audio/mpeg";
      const videoFile = "video/mp4";
      const documentFile = "application/pdf";

      expect(mime.isImage(imageFile)).toBe(true);
      expect(mime.isAudio(imageFile)).toBe(false);
      expect(mime.isVideo(imageFile)).toBe(false);

      expect(mime.isAudio(audioFile)).toBe(true);
      expect(mime.isMp3(audioFile)).toBe(true);
      expect(mime.isImage(audioFile)).toBe(false);

      expect(mime.isVideo(videoFile)).toBe(true);
      expect(mime.isMp4(videoFile)).toBe(true);
      expect(mime.isAudio(videoFile)).toBe(false);

      expect(mime.isPdf(documentFile)).toBe(true);
      expect(mime.isImage(documentFile)).toBe(false);
    });

    test("should handle MIME types with charset and other parameters", () => {
      expect(mime.isJson("application/json; charset=utf-8")).toBe(false);
      expect(mime.isHtml("text/html; charset=utf-8")).toBe(false);
      expect(mime.isCss("text/css; charset=utf-8")).toBe(false);
    });

    test("should handle unusual whitespace and formatting", () => {
      expect(mime.isJson("\n\t application/json \r\n")).toBe(true);
      expect(mime.isPng("  IMAGE/PNG  ")).toBe(true);
      expect(mime.isVideo("\t\t video/mp4\t\t")).toBe(true);
    });

    test("should differentiate between similar MIME types", () => {
      // JPG vs JPEG
      expect(mime.isJpg("image/jpeg")).toBe(true);
      expect(mime.isJpeg("image/jpeg")).toBe(true);

      // MP3 vs MP4
      expect(mime.isMp3("audio/mp3")).toBe(true);
      expect(mime.isMp4("audio/mp3")).toBe(false);

      expect(mime.isMp3("audio/mpeg")).toBe(true);
      expect(mime.isMp4("audio/mpeg")).toBe(false);

      // Text types
      expect(mime.isText("text/plain")).toBe(true);
      expect(mime.isHtml("text/plain")).toBe(false);
      expect(mime.isCss("text/plain")).toBe(false);
    });

    test("should handle complex JSON MIME types", () => {
      const jsonTypes = [
        "application/json",
        "application/hal+json",
        "application/ld+json",
        "application/vnd.api+json",
        "application/problem+json",
        "application/merge-patch+json",
      ];

      jsonTypes.forEach((mimeType) => {
        expect(mime.isJson(mimeType)).toBe(true);
      });
    });

    test("should handle complex XML MIME types", () => {
      const xmlTypes = [
        "text/xml",
        "application/xml",
        "image/svg+xml",
        "application/rss+xml",
        "application/atom+xml",
        "application/xhtml+xml",
      ];

      xmlTypes.forEach((mimeType) => {
        expect(mime.isXml(mimeType)).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle very long MIME type strings", () => {
      const longMimeType = `application/${"x".repeat(1000)}`;
      expect(mime.isJson(longMimeType)).toBe(false);
      expect(mime.isImage(longMimeType)).toBe(false);
    });

    test("should handle MIME types with special characters", () => {
      expect(mime.isFont("font/woff2")).toBe(true);
      expect(mime.isExcel("application/vnd.ms-excel")).toBe(true);
      expect(mime.isSvg("image/svg+xml")).toBe(true);
    });

    test("should handle borderline cases", () => {
      // Empty-ish strings
      expect(mime.isJson("")).toBe(false);
      expect(mime.isJson("   ")).toBe(false);
      expect(mime.isJson("\t\n\r")).toBe(false);

      // Almost valid MIME types
      expect(mime.isJson("application/jsonx")).toBe(false);
      expect(mime.isPng("image/pngx")).toBe(false);
      expect(mime.isMp4("video/mp4x")).toBe(false);
    });

    test("should be consistent with case variations", () => {
      const testCases = [
        { method: "isJson" as const, mime: "application/json" },
        { method: "isPng" as const, mime: "image/png" },
        { method: "isMp4" as const, mime: "video/mp4" },
        { method: "isHtml" as const, mime: "text/html" },
      ];

      testCases.forEach(({ method, mime: baseMime }) => {
        const variations = [
          baseMime.toLowerCase(),
          baseMime.toUpperCase(),
          baseMime.charAt(0).toUpperCase() + baseMime.slice(1),
          baseMime
            .split("/")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("/"),
        ];

        variations.forEach((mimeVariation) => {
          const mimeMethod = mime[method];
          expect(mimeMethod(mimeVariation)).toBe(true);
        });
      });
    });
  });

  describe("Performance Tests", () => {
    test("should handle multiple rapid checks efficiently", () => {
      const mimeTypes = ["application/json", "image/png", "video/mp4", "audio/mpeg", "text/html", "application/pdf"];

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        mimeTypes.forEach((mimeType) => {
          mime.isJson(mimeType);
          mime.isImage(mimeType);
          mime.isVideo(mimeType);
          mime.isAudio(mimeType);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete reasonably fast (less than 1 second for 24,000 checks)
      expect(duration).toBeLessThan(1000);
    });
  });
});
