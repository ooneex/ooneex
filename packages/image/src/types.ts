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
}
