export type ConvertorOptionsType = {
  outputDir?: string;
  password?: string;
  imageFormat?: "png" | "jpeg";
  pages?: string;
  quiet?: boolean;
};

export type ChunkType = {
  text: string;
  metadata: {
    heading: string | null;
    page: number | null;
    pages: number[];
    source: string | null;
  };
};

export type ConvertorFileType = { name: string; path: string };

export type IConvertor = {
  convert: (options?: ConvertorOptionsType) => AsyncGenerator<ChunkType, { json: ConvertorFileType; markdown: ConvertorFileType }>;
};
