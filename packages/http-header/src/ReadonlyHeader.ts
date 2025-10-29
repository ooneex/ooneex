import type { MimeType } from "@ooneex/http-mimes";
import { UAParser } from "ua-parser-js";
import type { CharsetType, EncodingType, HeaderFieldType, IReadonlyHeader, IUserAgent, MethodType } from "./types";

export class ReadonlyHeader implements IReadonlyHeader {
  constructor(public readonly native: Headers) {}

  public get(name: HeaderFieldType): string | null {
    return this.native.get(name);
  }

  public getCharset(): CharsetType | null {
    const contentType = this.getContentType();

    if (!contentType) {
      return null;
    }

    const match = (contentType as string).match(/charset *= *(?<charset>[a-z0-9-]+)/i);

    if (!match) {
      return null;
    }

    return (match[1]?.toUpperCase() || null) as CharsetType | null;
  }

  public getCacheControl(): string | null {
    return this.get("Cache-Control");
  }

  public getEtag(): string | null {
    return this.get("Etag");
  }

  public getAccept(): MimeType | "*/*" | null {
    return (this.get("Accept") ?? null) as MimeType | "*/*" | null;
  }

  public getAcceptEncoding(): EncodingType[] | null {
    const encoding = this.get("Accept-Encoding");

    if (!encoding) {
      return null;
    }

    return encoding.split(",").map((val) => {
      return val.trim();
    }) as EncodingType[] | null;
  }

  public getAllow(): MethodType[] | null {
    const allow = this.get("Allow");
    if (!allow) {
      return null;
    }

    return allow.split(",").map((method) => method.trim()) as MethodType[];
  }

  public getContentLength(): number {
    const length = this.get("Content-Length") || null;

    return length ? Number.parseInt(length, 10) : 0;
  }

  public getContentType(): MimeType | "*/*" | null {
    return this.get("Content-Type") as MimeType | "*/*" | null;
  }

  public getContentDisposition(): string | null {
    return this.get("Content-Disposition");
  }

  public getHost(): string | null {
    return this.get("Host");
  }

  public getIp(): string | null {
    return this.get("X-Forwarded-For") || this.get("X-Real-IP") || null;
  }

  public getReferer(): string | null {
    return this.get("Referer");
  }

  public getRefererPolicy(): string | null {
    return this.get("Referrer-Policy");
  }

  public getUserAgent(): IUserAgent {
    const userAgent = this.get("User-Agent");
    if (!userAgent) {
      return {
        browser: {},
        engine: {},
        os: {},
        device: {},
        cpu: {},
      };
    }

    return UAParser(userAgent);
  }

  public getAuthorization(): string | null {
    return this.get("Authorization");
  }

  public getBasicAuth(): string | null {
    const auth = this.get("Authorization");

    if (!auth) {
      return null;
    }

    const match = auth.match(/Basic +(?<auth>[^, ]+)/);

    if (!match) {
      return null;
    }

    return match[1] || null;
  }

  public getBearerToken(): string | null {
    const token = this.get("Authorization");

    if (!token) {
      return null;
    }

    const match = token.match(/Bearer +(?<token>[^, ]+)/);

    if (!match) {
      return null;
    }

    return match[1] || null;
  }

  public has(name: HeaderFieldType): boolean {
    return this.native.has(name);
  }

  public toJson(): Partial<Record<HeaderFieldType, string>> {
    const headers: Partial<Record<HeaderFieldType, string>> = {};

    for (const [key, value] of this) {
      headers[key] = value as string;
    }

    return headers;
  }

  [Symbol.iterator](): IterableIterator<[HeaderFieldType, string]> {
    // Create an iterator for the headers
    const headers: [HeaderFieldType, string][] = [];
    this.native.forEach((value, key) => {
      headers.push([key as HeaderFieldType, value]);
    });
    return headers[Symbol.iterator]();
  }
}
