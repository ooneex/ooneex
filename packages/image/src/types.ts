import type { IStatus } from "@ooneex/status";
import type { IBase, ScalarType } from "@ooneex/types";

export type ImageFormatType =
  | "jpeg"
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "svg"
  | "avif"
  | "bmp"
  | "tiff"
  | "ico"
  | "heic"
  | "heif";

export type ImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/svg+xml"
  | "image/avif"
  | "image/bmp"
  | "image/x-ms-bmp"
  | "image/tiff"
  | "image/vnd.microsoft.icon"
  | "image/x-icon"
  | "image/heic"
  | "image/heif";

export interface IImage extends IBase {
  id: string;
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
  tags?: string[];
}
