import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IBase, ScalarType } from "@ooneex/types";

export const IMAGE_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "svg",
  "avif",
  "bmp",
  "tiff",
  "ico",
  "heic",
  "heif",
] as const;

export type ImageFormatType = (typeof IMAGE_FORMATS)[number];

export const IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/x-icon",
  "image/heic",
  "image/heif",
] as const;

export type ImageMimeType = (typeof IMAGE_MIMES)[number];

export interface IImage extends IBase {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  // File info
  format?: ImageFormatType;
  mimeType?: ImageMimeType;
  size?: number;
  metadata?: Record<string, ScalarType>;
  status?: IStatus;
  tags?: ITag[];
  context?: string;
  contextId?: string;
}

export interface IImageShared extends IBase {
  image?: IImage;
  imageId?: string;
  sharedWith?: string;
  sharedById?: string;
  permission?: string;
  expiresAt?: string;
}

export interface IImageLiked extends IBase {
  image?: IImage;
  imageId?: string;
  likedBy?: string;
  likedById?: string;
}

export interface IImageComment extends IBase {
  image?: IImage;
  imageId?: string;
  comment: string;
  commentedBy?: string;
  commentedById?: string;
  parentCommentId?: string;
}

export interface IImageDisliked extends IBase {
  image?: IImage;
  imageId?: string;
  dislikedBy?: string;
  dislikedById?: string;
}

export interface IImageSaved extends IBase {
  image?: IImage;
  imageId?: string;
  savedBy?: string;
  savedById?: string;
}

export interface IImageReport extends IBase {
  image?: IImage;
  imageId?: string;
  reason: string;
  description?: string;
  reportedBy?: string;
  reportedById?: string;
  status?: IStatus;
}

export interface IImageDownloaded extends IBase {
  image?: IImage;
  imageId?: string;
  downloadedBy?: string;
  downloadedById?: string;
}

export interface IImageViewed extends IBase {
  image?: IImage;
  imageId?: string;
  viewedBy?: string;
  viewedById?: string;
}

export interface IImageStat extends IBase {
  image?: IImage;
  imageId?: string;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  downloadsCount?: number;
  viewsCount?: number;
  reportsCount?: number;
}
