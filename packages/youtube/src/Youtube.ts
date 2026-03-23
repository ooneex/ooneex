import type {
  IYoutube,
} from "./types";

export class Youtube implements IYoutube {
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

    if (!/^[\w-]{10,12}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  }

  public getWatchUrl(urlOrId: string): string | null {
    const videoId = this.getWatchId(urlOrId) ?? urlOrId;

    if (!/^[\w-]{10,12}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
