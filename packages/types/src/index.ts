import type { LocaleType } from "@ooneex/translation";

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;

export type HttpMethodType = (typeof HTTP_METHODS)[number];
export type EncodingType = "deflate" | "gzip" | "compress" | "br" | "identity" | "*";
export type CharsetType = "ISO-8859-1" | "7-BIT" | "UTF-8" | "UTF-16" | "US-ASCII";
export type ScalarType = boolean | number | bigint | string;

export interface IBase {
  id: string;
  isLocked?: boolean;
  lockedAt?: Date;
  isBlocked?: boolean;
  blockedAt?: Date;
  blockReason?: string;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  language?: LocaleType;
}

export interface IStat extends IBase {
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
  viewsCount: number;
  downloadsCount: number;
  savesCount: number;
  bookmarksCount: number;
  repostsCount: number;
  impressionsCount: number;
  clicksCount: number;
  engagementRate: number;
  reach: number;
  followersCount: number;
  followingCount: number;
  blockedCount: number;
  reportsCount: number;
}

export type FilterResultType<T> = {
  resources: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};
