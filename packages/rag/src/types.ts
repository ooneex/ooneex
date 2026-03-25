import type { Connection } from "@lancedb/lancedb";
import type { EmbeddingFunction } from "@lancedb/lancedb/embedding";
import type {
  Binary,
  Bool,
  DateDay,
  DateMillisecond,
  Decimal,
  Float16,
  Float32,
  Float64,
  Int8,
  Int16,
  Int32,
  Int64,
  LargeBinary,
  LargeUtf8,
  Null,
  Uint8,
  Uint16,
  Uint32,
  Uint64,
  Utf8,
} from "apache-arrow";
import type { VectorTable } from "./VectorTable.ts";

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
  convert: (
    options?: ConvertorOptionsType,
  ) => AsyncGenerator<ChunkType, { json: ConvertorFileType; markdown: ConvertorFileType }>;
};

export type IVectorDatabase<DataType extends Record<string, unknown>> = {
  getDatabaseUri: () => string;
  connect: () => Promise<void>;
  getDatabase: () => Connection;
  getEmbeddingModel: () => { provider: EmbeddingProviderType; model: EmbeddingModelType["model"] };
  getSchema: () => { [K in keyof DataType]: FieldValueType };
  open: (name: string, options?: { mode?: "create" | "overwrite" }) => Promise<VectorTable<DataType>>;
};

export type OpenAIModelType = "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";

export type EmbeddingProviderType = "openai";

export type EmbeddingModelMapType = {
  openai: OpenAIModelType;
};

export type EmbeddingModelType<P extends EmbeddingProviderType = EmbeddingProviderType> = {
  provider: P;
  model: EmbeddingModelMapType[P];
};

export type FieldValueType =
  | Null
  | Bool
  | Int8
  | Int16
  | Int32
  | Int64
  | Uint8
  | Uint16
  | Uint32
  | Uint64
  | Float16
  | Float32
  | Float64
  | Utf8
  | LargeUtf8
  | Binary
  | LargeBinary
  | Decimal
  | DateDay
  | DateMillisecond
  | EmbeddingFunction;

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type VectorDatabaseClassType = new (...args: any[]) => IVectorDatabase<any>;

export type FilterField<T> = keyof T | "id" | "text";

export type FilterCondition<T> =
  | { field: FilterField<T>; op: ">" | ">=" | "<" | "<=" | "="; value: string | number }
  | { field: FilterField<T>; op: "IN"; value: (string | number)[] }
  | { field: FilterField<T>; op: "LIKE" | "NOT LIKE"; value: string }
  | { field: FilterField<T>; op: "IS NULL" | "IS NOT NULL"; value?: never }
  | { field: FilterField<T>; op: "IS TRUE" | "IS NOT TRUE" | "IS FALSE" | "IS NOT FALSE"; value?: never };

export type Filter<T> = FilterCondition<T> | { AND: Filter<T>[] } | { OR: Filter<T>[] } | { NOT: Filter<T> };
