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
    const token = this.get("Authorization") || null;

    const match = token?.match(/Bearer +(?<token>[^, ]+)/);

    return match?.[1] || null;
  }

  public getCookies(): Record<string, string> | null {
    const cookieHeader = this.get("Cookie");

    if (!cookieHeader) {
      return null;
    }

    const cookies: Record<string, string> = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...valueParts] = cookie.trim().split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=");
        cookies[key.trim()] = decodeURIComponent(value.trim());
      }
    });

    return Object.keys(cookies).length > 0 ? cookies : null;
  }

  public getCookie(name: string): string | null {
    const cookies = this.getCookies();

    return cookies?.[name] || null;
  }

  public has(name: HeaderFieldType): boolean {
    return this.native.has(name);
  }

  public toJson(): Partial<Record<HeaderFieldType, string>> {
    const headers: Partial<Record<HeaderFieldType, string>> = {};

    this.native.forEach((value, key) => {
      headers[key as HeaderFieldType] = value;
    });

    return headers;
  }

  public getAcceptLanguage(): string[] | null {
    const acceptLanguage = this.get("Accept-Language");

    if (!acceptLanguage) {
      return null;
    }

    return acceptLanguage
      .split(",")
      .map((lang) => {
        return lang.split(";")[0]?.trim();
      })
      .filter((lang): lang is string => Boolean(lang));
  }

  public getAcceptRanges(): string | null {
    return this.get("Accept-Ranges");
  }

  public getAge(): number | null {
    const age = this.get("Age");
    return age ? Number.parseInt(age, 10) : null;
  }

  public getConnection(): string | null {
    return this.get("Connection");
  }

  public getContentEncoding(): string | null {
    return this.get("Content-Encoding");
  }

  public getContentLanguage(): string | null {
    return this.get("Content-Language");
  }

  public getContentLocation(): string | null {
    return this.get("Content-Location");
  }

  public getContentRange(): string | null {
    return this.get("Content-Range");
  }

  public getDate(): Date | null {
    const date = this.get("Date");
    return date ? new Date(date) : null;
  }

  public getExpires(): Date | null {
    const expires = this.get("Expires");
    return expires ? new Date(expires) : null;
  }

  public getLastModified(): Date | null {
    const lastModified = this.get("Last-Modified");
    return lastModified ? new Date(lastModified) : null;
  }

  public getLocation(): string | null {
    return this.get("Location");
  }

  public getOrigin(): string | null {
    return this.get("Origin");
  }

  public getRange(): string | null {
    return this.get("Range");
  }

  public getServer(): string | null {
    return this.get("Server");
  }

  public getTransferEncoding(): string | null {
    return this.get("Transfer-Encoding");
  }

  public getUpgrade(): string | null {
    return this.get("Upgrade");
  }

  public getVary(): string[] | null {
    const vary = this.get("Vary");

    if (!vary) {
      return null;
    }

    return vary.split(",").map((header) => header.trim());
  }

  public getWWWAuthenticate(): string | null {
    return this.get("WWW-Authenticate");
  }

  public getXForwardedFor(): string | null {
    return this.get("X-Forwarded-For");
  }

  public getXForwardedHost(): string | null {
    return this.get("X-Forwarded-Host");
  }

  public getXForwardedProto(): string | null {
    return this.get("X-Forwarded-Proto");
  }

  public getXRequestedWith(): string | null {
    return this.get("X-Requested-With");
  }

  public getXRealIP(): string | null {
    return this.get("X-Real-IP");
  }

  public getAccessControlAllowOrigin(): string | null {
    return this.get("Access-Control-Allow-Origin");
  }

  public getAccessControlAllowMethods(): MethodType[] | null {
    const methods = this.get("Access-Control-Allow-Methods");

    if (!methods) {
      return null;
    }

    return methods.split(",").map((method) => method.trim()) as MethodType[];
  }

  public getAccessControlAllowHeaders(): string[] | null {
    const headers = this.get("Access-Control-Allow-Headers");

    if (!headers) {
      return null;
    }

    return headers.split(",").map((header) => header.trim());
  }

  public getAccessControlAllowCredentials(): boolean | null {
    const credentials = this.get("Access-Control-Allow-Credentials");

    if (!credentials) {
      return null;
    }

    return credentials.toLowerCase() === "true";
  }

  public getAccessControlMaxAge(): number | null {
    const maxAge = this.get("Access-Control-Max-Age");
    return maxAge ? Number.parseInt(maxAge, 10) : null;
  }
  public getAccessControlExposeHeaders(): string[] | null {
    const headers = this.get("Access-Control-Expose-Headers");

    if (!headers) {
      return null;
    }

    return headers.split(",").map((header) => header.trim());
  }

  public getContentSecurityPolicy(): string | null {
    return this.get("Content-Security-Policy");
  }

  public getStrictTransportSecurity(): string | null {
    return this.get("Strict-Transport-Security");
  }

  public getXContentTypeOptions(): string | null {
    return this.get("X-Content-Type-Options");
  }

  public getXFrameOptions(): string | null {
    return this.get("X-Frame-Options");
  }

  public getXXSSProtection(): string | null {
    return this.get("X-XSS-Protection");
  }

  public getWebSocketAccept(): string | null {
    return this.get("Sec-WebSocket-Accept");
  }

  public getWebSocketKey(): string | null {
    return this.get("Sec-WebSocket-Key");
  }

  public getWebSocketVersion(): string | null {
    return this.get("Sec-WebSocket-Version");
  }

  public getWebSocketProtocol(): string | null {
    return this.get("Sec-WebSocket-Protocol");
  }

  public getApiVersion(): string | null {
    return this.get("X-API-Version");
  }

  public getRequestId(): string | null {
    return this.get("X-Request-ID");
  }

  public getRateLimitLimit(): number | null {
    const limit = this.get("X-RateLimit-Limit");
    return limit ? Number.parseInt(limit, 10) : null;
  }

  public getRateLimitRemaining(): number | null {
    const remaining = this.get("X-RateLimit-Remaining");
    return remaining ? Number.parseInt(remaining, 10) : null;
  }

  public getRateLimitReset(): number | null {
    const reset = this.get("X-RateLimit-Reset");
    return reset ? Number.parseInt(reset, 10) : null;
  }

  public getPoweredBy(): string | null {
    return this.get("X-Powered-By");
  }

  public getRetryAfter(): number | null {
    const retryAfter = this.get("Retry-After");
    return retryAfter ? Number.parseInt(retryAfter, 10) : null;
  }

  public getIfMatch(): string | null {
    return this.get("If-Match");
  }

  public getIfNoneMatch(): string | null {
    return this.get("If-None-Match");
  }

  public getIfModifiedSince(): Date | null {
    const ifModifiedSince = this.get("If-Modified-Since");
    return ifModifiedSince ? new Date(ifModifiedSince) : null;
  }

  public getIfUnmodifiedSince(): Date | null {
    const ifUnmodifiedSince = this.get("If-Unmodified-Since");
    return ifUnmodifiedSince ? new Date(ifUnmodifiedSince) : null;
  }

  public getIfRange(): string | null {
    return this.get("If-Range");
  }

  public isSecure(): boolean {
    const proto = this.getXForwardedProto();
    return proto === "https";
  }
  public isAjax(): boolean {
    return this.getXRequestedWith()?.toLowerCase() === "xmlhttprequest";
  }

  public isCorsRequest(): boolean {
    return this.has("Origin");
  }

  public isWebSocketRequest(): boolean {
    const upgrade = this.getUpgrade();
    const connection = this.getConnection();
    return upgrade?.toLowerCase() === "websocket" && connection?.toLowerCase().includes("upgrade") === true;
  }

  public getClientIps(): string[] {
    const ips: string[] = [];

    // Check X-Forwarded-For header (can contain multiple IPs)
    const xForwardedFor = this.getXForwardedFor();
    if (xForwardedFor) {
      const forwardedIps = xForwardedFor.split(",").map((ip) => ip.trim());
      ips.push(...forwardedIps);
    }

    // Check X-Real-IP header
    const xRealIp = this.getXRealIP();
    if (xRealIp && !ips.includes(xRealIp)) {
      ips.push(xRealIp);
    }

    // Check generic IP header
    const ip = this.getIp();
    if (ip && !ips.includes(ip)) {
      ips.push(ip);
    }

    return ips.filter((ip) => ip && ip.length > 0);
  }

  public *[Symbol.iterator](): IterableIterator<[HeaderFieldType, string]> {
    const entries: [HeaderFieldType, string][] = [];
    this.native.forEach((value, key) => {
      entries.push([key as HeaderFieldType, value]);
    });
    for (const entry of entries) {
      yield entry;
    }
  }
}
