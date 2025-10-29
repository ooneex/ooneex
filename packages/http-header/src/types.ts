import type { MimeType } from "@ooneex/http-mimes";
import type { HEADERS } from "./constants";

export type HeaderFieldType = (typeof HEADERS)[number] | `X-Custom-${string}` | "X-Real-IP";

export type UserAgentType = {
  browser: {
    name?: string;
    version?: string;
    major?: string;
  };
  engine: {
    name?: string;
    version?: string;
  };
  os: {
    name?: string;
    version?: string;
  };
  device: {
    vendor?: string;
    model?: string;
    type?: string;
  };
  cpu: {
    architecture?: string;
  };
};

export type UserAgentBrowserType = UserAgentType["browser"];
export type UserAgentEngineType = UserAgentType["engine"];
export type UserAgentOsType = UserAgentType["os"];
export type UserAgentDeviceType = UserAgentType["device"];
export type UserAgentCpuType = UserAgentType["cpu"];

export interface IUserAgent {
  readonly browser: UserAgentBrowserType;
  readonly engine: UserAgentEngineType;
  readonly os: UserAgentOsType;
  readonly device: UserAgentDeviceType;
  readonly cpu: UserAgentCpuType;
}

export type MethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
export type EncodingType = "deflate" | "gzip" | "compress" | "br" | "identity" | "*";
export type CharsetType = "ISO-8859-1" | "7-BIT" | "UTF-8" | "UTF-16" | "US-ASCII";

export interface IHeader extends IReadonlyHeader {
  readonly native: Headers;
  setCacheControl: (value: string) => IHeader;
  setEtag: (value: string) => IHeader;
  setAuthorization: (value: string) => IHeader;
  setBasicAuth: (token: string) => IHeader;
  setBearerToken: (token: string) => IHeader;
  setBlobType: (charset?: CharsetType) => IHeader;
  setJson: (charset?: CharsetType) => IHeader;
  setStream: (charset?: CharsetType) => IHeader;
  setFormData: (charset?: CharsetType) => IHeader;
  setForm: (charset?: CharsetType) => IHeader;
  setHtml: (charset?: CharsetType) => IHeader;
  setText: (charset?: CharsetType) => IHeader;
  contentType: (value: MimeType, charset?: CharsetType) => IHeader;
  contentDisposition: (value: string) => IHeader;
  contentLength: (length: number) => IHeader;
  setCustom: (value: string) => IHeader;
  add: (name: HeaderFieldType, value: string) => IHeader;
  remove: (name: HeaderFieldType) => IHeader;
  set: (name: HeaderFieldType, value: string) => IHeader;

  // CORS Headers
  setAccessControlAllowOrigin: (origin: string) => IHeader;
  setAccessControlAllowMethods: (methods: MethodType[]) => IHeader;
  setAccessControlAllowHeaders: (headers: string[]) => IHeader;
  setAccessControlAllowCredentials: (allow: boolean) => IHeader;
  setAccessControlMaxAge: (seconds: number) => IHeader;
  setAccessControlExposeHeaders: (headers: string[]) => IHeader;

  // Security Headers
  setContentSecurityPolicy: (policy: string) => IHeader;
  setStrictTransportSecurity: (maxAge: number, includeSubDomains?: boolean, preload?: boolean) => IHeader;
  setXContentTypeOptions: (value?: string) => IHeader;
  setXFrameOptions: (value: "DENY" | "SAMEORIGIN" | string) => IHeader;
  setXXSSProtection: (enabled?: boolean, mode?: string) => IHeader;
  setReferrerPolicy: (policy: string) => IHeader;

  // Request/Response Headers
  setAccept: (mimeType: MimeType) => IHeader;
  setAcceptLanguage: (languages: string[]) => IHeader;
  setAcceptEncoding: (encodings: string[]) => IHeader;
  setUserAgent: (userAgent: string) => IHeader;
  setHost: (host: string) => IHeader;
  setReferer: (referer: string) => IHeader;
  setOrigin: (origin: string) => IHeader;
  setLocation: (location: string) => IHeader;

  // Connection and Transfer Headers
  setConnection: (value: "close" | "keep-alive" | string) => IHeader;
  setTransferEncoding: (encoding: "chunked" | "gzip" | "deflate" | string) => IHeader;
  setContentEncoding: (encoding: "gzip" | "deflate" | "br" | string) => IHeader;
  setAcceptRanges: (value: "bytes" | "none" | string) => IHeader;
  setContentRange: (value: string) => IHeader;
  setRange: (value: string) => IHeader;

  // Cookie Headers
  setCookie: (
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
  ) => IHeader;

  // Date/Time Headers
  setDate: (date?: Date) => IHeader;
  setExpires: (date: Date) => IHeader;
  setLastModified: (date: Date) => IHeader;
  setIfModifiedSince: (date: Date) => IHeader;
  setIfUnmodifiedSince: (date: Date) => IHeader;

  // Server Information Headers
  setServer: (server: string) => IHeader;
  setRetryAfter: (seconds: number) => IHeader;

  // API and Custom Headers
  setApiVersion: (version: string) => IHeader;
  setRequestId: (id: string) => IHeader;
  setRateLimit: (limit: number, remaining: number, reset: number) => IHeader;
  setPoweredBy: (value: string) => IHeader;
  removePoweredBy: () => IHeader;

  // Compression and Content Headers
  setVary: (headers: string[]) => IHeader;
  setAge: (seconds: number) => IHeader;
  setContentLanguage: (language: string) => IHeader;
  setContentLocation: (location: string) => IHeader;

  // WebSocket Headers
  setWebSocketAccept: (key: string) => IHeader;
  setWebSocketKey: (key: string) => IHeader;
  setWebSocketVersion: (version: string) => IHeader;
  setWebSocketProtocol: (protocol: string) => IHeader;
  setUpgrade: (protocol: string) => IHeader;
}

export interface IReadonlyHeader {
  readonly native: Headers;
  get: (name: HeaderFieldType) => string | null;
  getAllow: () => MethodType[] | null;
  getAccept: () => MimeType | "*/*" | null;
  getAcceptEncoding: () => EncodingType[] | null;
  getAcceptLanguage: () => string[] | null;
  getAcceptRanges: () => string | null;
  getAge: () => number | null;
  getConnection: () => string | null;
  getContentLength: () => number;
  getContentType: () => MimeType | "*/*" | null;
  getContentDisposition: () => string | null;
  getContentEncoding: () => string | null;
  getContentLanguage: () => string | null;
  getContentLocation: () => string | null;
  getContentRange: () => string | null;
  getUserAgent: () => IUserAgent;
  getAuthorization: () => string | null;
  getBasicAuth: () => string | null;
  getBearerToken: () => string | null;
  getHost: () => string | null;
  getIp: () => string | null;
  getReferer: () => string | null;
  getRefererPolicy: () => string | null;
  getCharset: () => CharsetType | null;
  getCacheControl: () => string | null;
  getEtag: () => string | null;
  getCookies: () => Record<string, string> | null;
  getCookie: (name: string) => string | null;
  getDate: () => Date | null;
  getExpires: () => Date | null;
  getLastModified: () => Date | null;
  getLocation: () => string | null;
  getOrigin: () => string | null;
  getRange: () => string | null;
  getServer: () => string | null;
  getTransferEncoding: () => string | null;
  getUpgrade: () => string | null;
  getVary: () => string[] | null;
  getWWWAuthenticate: () => string | null;
  getXForwardedFor: () => string | null;
  getXForwardedHost: () => string | null;
  getXForwardedProto: () => string | null;
  getXRequestedWith: () => string | null;
  getXRealIP: () => string | null;
  getAccessControlAllowOrigin: () => string | null;
  getAccessControlAllowMethods: () => MethodType[] | null;
  getAccessControlAllowHeaders: () => string[] | null;
  getAccessControlAllowCredentials: () => boolean | null;
  getAccessControlMaxAge: () => number | null;
  getAccessControlExposeHeaders: () => string[] | null;
  getContentSecurityPolicy: () => string | null;
  getStrictTransportSecurity: () => string | null;
  getXContentTypeOptions: () => string | null;
  getXFrameOptions: () => string | null;
  getXXSSProtection: () => string | null;
  getWebSocketAccept: () => string | null;
  getWebSocketKey: () => string | null;
  getWebSocketVersion: () => string | null;
  getWebSocketProtocol: () => string | null;
  getApiVersion: () => string | null;
  getRequestId: () => string | null;
  getRateLimitLimit: () => number | null;
  getRateLimitRemaining: () => number | null;
  getRateLimitReset: () => number | null;
  getPoweredBy: () => string | null;
  getRetryAfter: () => number | null;
  getIfMatch: () => string | null;
  getIfNoneMatch: () => string | null;
  getIfModifiedSince: () => Date | null;
  getIfUnmodifiedSince: () => Date | null;
  getIfRange: () => string | null;
  isSecure: () => boolean;
  isAjax: () => boolean;
  isCorsRequest: () => boolean;
  isWebSocketRequest: () => boolean;
  getClientIps: () => string[];
  has: (name: HeaderFieldType) => boolean;
  [Symbol.iterator](): IterableIterator<[HeaderFieldType, string]>;
  toJson: () => Partial<Record<HeaderFieldType, string>>;
}
