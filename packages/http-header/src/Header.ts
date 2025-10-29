import type { MimeType } from "@ooneex/http-mimes";
import { ReadonlyHeader } from "./ReadonlyHeader";
import type { CharsetType, HeaderFieldType, IHeader, MethodType } from "./types";

export class Header extends ReadonlyHeader implements IHeader {
  constructor(headers?: Headers) {
    super(headers || new Headers());
  }

  public setCacheControl(value: string): this {
    return this.add("Cache-Control", value);
  }

  public setEtag(value: string): this {
    return this.add("Etag", value);
  }

  public setAuthorization(value: string): this {
    return this.add("Authorization", value);
  }

  public setBasicAuth(token: string): this {
    return this.add("Authorization", `Basic ${token}`);
  }

  public setBearerToken(token: string): this {
    return this.add("Authorization", `Bearer ${token}`);
  }

  public setBlobType(charset?: CharsetType): this {
    return this.contentType("application/octet-stream", charset);
  }

  public setJson(charset?: CharsetType): this {
    this.add("Accept", "application/json");
    this.contentType("application/json", charset);

    return this;
  }

  public setStream(charset?: CharsetType): this {
    return this.setBlobType(charset);
  }

  public setFormData(charset?: CharsetType): this {
    return this.contentType("multipart/form-data", charset);
  }

  public setForm(charset?: CharsetType): this {
    return this.contentType("application/x-www-form-urlencoded", charset);
  }

  public setHtml(charset?: CharsetType): this {
    return this.contentType("text/html", charset);
  }

  public setText(charset?: CharsetType): this {
    return this.contentType("text/plain", charset);
  }

  public contentType(type: MimeType, charset?: CharsetType): this {
    const typeStr = String(type);
    const value = charset ? `${typeStr}; charset=${charset}` : typeStr;
    this.add("Content-Type", value);

    if (typeStr.startsWith("text/") || typeStr === "application/json") {
      this.add("Accept-Charset", charset || "utf-8");
    }

    return this;
  }

  public contentDisposition(value: string): this {
    return this.add("Content-Disposition", value);
  }

  public contentLength(length: number): this {
    this.add("Content-Length", length.toString());
    return this;
  }

  public setCustom(value: string): this {
    return this.add("X-Custom", value);
  }

  public add(name: HeaderFieldType, value: string): this {
    this.native.append(name, value);
    return this;
  }

  public remove(name: HeaderFieldType): this {
    this.native.delete(name);
    return this;
  }

  public set(name: HeaderFieldType, value: string): this {
    this.native.set(name, value);
    return this;
  }

  public setAccessControlAllowOrigin(origin: string): this {
    return this.add("Access-Control-Allow-Origin", origin);
  }

  public setAccessControlAllowMethods(methods: MethodType[]): this {
    const value = methods.join(", ");
    return this.add("Access-Control-Allow-Methods", value);
  }

  public setAccessControlAllowHeaders(headers: string[]): this {
    const value = headers.join(", ");
    return this.add("Access-Control-Allow-Headers", value);
  }

  public setAccessControlAllowCredentials(allow: boolean): this {
    return this.add("Access-Control-Allow-Credentials", allow.toString());
  }

  public setAccessControlMaxAge(seconds: number): this {
    return this.add("Access-Control-Max-Age", seconds.toString());
  }

  public setAccessControlExposeHeaders(headers: string[]): this {
    const value = headers.join(", ");
    return this.add("Access-Control-Expose-Headers", value);
  }

  public setContentSecurityPolicy(policy: string): this {
    return this.add("Content-Security-Policy", policy);
  }

  public setStrictTransportSecurity(maxAge: number, includeSubDomains = false, preload = false): this {
    let value = `max-age=${maxAge}`;
    if (includeSubDomains) value += "; includeSubDomains";
    if (preload) value += "; preload";
    return this.add("Strict-Transport-Security", value);
  }

  public setXContentTypeOptions(value = "nosniff"): this {
    return this.add("X-Content-Type-Options", value);
  }

  public setXFrameOptions(value: "DENY" | "SAMEORIGIN" | string): this {
    return this.add("X-Frame-Options", value);
  }

  public setXXSSProtection(enabled = true, mode?: string): this {
    let value = enabled ? "1" : "0";
    if (enabled && mode) value += `; mode=${mode}`;
    return this.add("X-XSS-Protection", value);
  }

  public setReferrerPolicy(policy: string): this {
    return this.add("Referrer-Policy", policy);
  }

  public setAccept(mimeType: MimeType): this {
    return this.add("Accept", mimeType as string);
  }

  public setAcceptLanguage(languages: string[]): this {
    const value = languages.join(", ");
    return this.add("Accept-Language", value);
  }

  public setAcceptEncoding(encodings: string[]): this {
    const value = encodings.join(", ");
    return this.add("Accept-Encoding", value);
  }

  public setUserAgent(userAgent: string): this {
    return this.add("User-Agent", userAgent);
  }

  public setHost(host: string): this {
    return this.add("Host", host);
  }

  public setReferer(referer: string): this {
    return this.add("Referer", referer);
  }

  public setOrigin(origin: string): this {
    return this.add("Origin", origin);
  }

  public setLocation(location: string): this {
    return this.add("Location", location);
  }

  public setConnection(value: "close" | "keep-alive" | string): this {
    return this.add("Connection", value);
  }

  public setTransferEncoding(encoding: "chunked" | "gzip" | "deflate" | string): this {
    return this.add("Transfer-Encoding", encoding);
  }

  public setContentEncoding(encoding: "gzip" | "deflate" | "br" | string): this {
    return this.add("Content-Encoding", encoding);
  }

  public setAcceptRanges(value: "bytes" | "none" | string): this {
    return this.add("Accept-Ranges", value);
  }

  public setContentRange(range: string): this {
    return this.add("Content-Range", range);
  }

  public setRange(range: string): this {
    return this.add("Range", range);
  }

  public setCookie(
    name: string,
    value: string,
    options?: {
      domain?: string;
      path?: string;
      expires?: Date;
      maxAge?: number;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "Strict" | "Lax" | "None";
    },
  ): this {
    let cookieValue = `${name}=${value}`;

    if (options?.maxAge !== undefined) {
      cookieValue += `; Max-Age=${options.maxAge}`;
    }
    if (options?.expires) {
      cookieValue += `; Expires=${options.expires.toUTCString()}`;
    }
    if (options?.path) cookieValue += `; Path=${options.path}`;
    if (options?.domain) cookieValue += `; Domain=${options.domain}`;
    if (options?.secure) cookieValue += "; Secure";
    if (options?.httpOnly) cookieValue += "; HttpOnly";
    if (options?.sameSite) cookieValue += `; SameSite=${options.sameSite}`;

    return this.add("Set-Cookie", cookieValue);
  }

  public setDate(date: Date = new Date()): this {
    return this.add("Date", date.toUTCString());
  }

  public setExpires(date: Date): this {
    return this.add("Expires", date.toUTCString());
  }

  public setLastModified(date: Date): this {
    return this.add("Last-Modified", date.toUTCString());
  }

  public setIfModifiedSince(date: Date): this {
    return this.add("If-Modified-Since", date.toUTCString());
  }

  public setIfUnmodifiedSince(date: Date): this {
    return this.add("If-Unmodified-Since", date.toUTCString());
  }

  public setServer(server: string): this {
    return this.add("Server", server);
  }

  public setRetryAfter(seconds: number): this {
    return this.add("Retry-After", seconds.toString());
  }

  public setApiVersion(version: string): this {
    return this.add("X-API-Version", version);
  }

  public setRequestId(id: string): this {
    return this.add("X-Request-ID", id);
  }

  public setRateLimit(limit: number, remaining: number, reset: number): this {
    this.add("X-RateLimit-Limit", limit.toString());
    this.add("X-RateLimit-Remaining", remaining.toString());
    this.add("X-RateLimit-Reset", reset.toString());
    return this;
  }

  public setPoweredBy(value: string): this {
    return this.add("X-Powered-By", value);
  }

  public removePoweredBy(): this {
    return this.remove("X-Powered-By");
  }

  public setVary(headers: string[]): this {
    const value = headers.join(", ");
    return this.add("Vary", value);
  }

  public setAge(seconds: number): this {
    return this.add("Age", seconds.toString());
  }

  public setContentLanguage(language: string): this {
    return this.add("Content-Language", language);
  }

  public setContentLocation(location: string): this {
    return this.add("Content-Location", location);
  }

  public setWebSocketAccept(key: string): this {
    return this.add("Sec-WebSocket-Accept", key);
  }

  public setWebSocketKey(key: string): this {
    return this.add("Sec-WebSocket-Key", key);
  }

  public setWebSocketVersion(version: string): this {
    return this.add("Sec-WebSocket-Version", version);
  }

  public setWebSocketProtocol(protocol: string): this {
    return this.add("Sec-WebSocket-Protocol", protocol);
  }

  public setUpgrade(protocol: string): this {
    return this.add("Upgrade", protocol);
  }
}
