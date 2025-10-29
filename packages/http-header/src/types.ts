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
  setJsonType: (charset?: CharsetType) => IHeader;
  setStreamType: (charset?: CharsetType) => IHeader;
  setFormDataType: (charset?: CharsetType) => IHeader;
  setFormType: (charset?: CharsetType) => IHeader;
  setHtmlType: (charset?: CharsetType) => IHeader;
  setTextType: (charset?: CharsetType) => IHeader;
  contentType: (value: MimeType, charset?: CharsetType) => IHeader;
  contentDisposition: (value: string) => IHeader;
  contentLength: (length: number) => IHeader;
  setCustom: (value: string) => IHeader;
  add: (name: HeaderFieldType, value: string) => IHeader;
  delete: (name: HeaderFieldType) => IHeader;
  set: (name: HeaderFieldType, value: string) => IHeader;
}

export interface IReadonlyHeader {
  readonly native: Headers;
  get: (name: HeaderFieldType) => string | null;
  getAllow: () => MethodType[] | null;
  getAccept: () => MimeType | "*/*" | null;
  getAcceptEncoding: () => EncodingType[] | null;
  getContentLength: () => number;
  getContentType: () => MimeType | "*/*" | null;
  getContentDisposition: () => string | null;
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
  has: (name: HeaderFieldType) => boolean;
  [Symbol.iterator](): IterableIterator<[HeaderFieldType, string]>;
  toJson: () => Partial<Record<HeaderFieldType, string>>;
}
