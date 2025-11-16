export type HttpMethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
export type EncodingType = "deflate" | "gzip" | "compress" | "br" | "identity" | "*";
export type CharsetType = "ISO-8859-1" | "7-BIT" | "UTF-8" | "UTF-16" | "US-ASCII";
export type ScalarType = boolean | number | bigint | string;

export interface IBase {
  isLocked?: boolean;
  lockedAt?: Date;
  isBlocked?: boolean;
  blockedAt?: Date;
  blockReason?: string;
  isPublic?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
