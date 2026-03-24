import type { convert } from "@opendataloader/pdf";

/**
 * Image format for extracted images
 */
export type ConvertorImageFormatType = "png" | "jpeg";

/**
 * Options for PDF conversion
 */
export interface ConvertorOptionsType {
  /**
   * Output directory where converted files are written
   */
  outputDir?: string;
  /**
   * Password for encrypted PDF files
   */
  password?: string;
  /**
   * Output format for extracted images (default: "png")
   */
  imageFormat?: ConvertorImageFormatType;
  /**
   * Pages to extract (e.g., "1,3,5-7")
   */
  pages?: string;
  /**
   * Suppress console logging output
   */
  quiet?: boolean;
  /**
   * Number of pages to process concurrently (default: 5)
   */
  concurrency?: number;
}

/**
 * Convert function type from @opendataloader/pdf
 */
export type ConvertFnType = typeof convert;

export type ConvertorPageResultType = {
  page: number;
  images: { name: string; path: string }[];
  content: { name: string; path: string };
  pdf: { name: string; path: string };
};

export type ConvertorResultType = ConvertorPageResultType[];

/**
 * Interface for the Convertor class
 */
export interface IConvertor {
  /**
   * Convert PDF to the specified formats
   * @param options - Conversion options
   */
  convert: (options?: ConvertorOptionsType) => AsyncGenerator<ConvertorPageResultType, void, unknown>;
}
