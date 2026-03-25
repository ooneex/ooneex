import type { ScalarType } from "@ooneex/types";
import { AbstractVectorDatabase } from "./AbstractVectorDatabase.ts";
import type { EmbeddingModelType, EmbeddingProviderType, FieldValueType } from "./types.ts";

export class VectorDatabase<DataType extends Record<string, ScalarType>> extends AbstractVectorDatabase<DataType> {
  public getDatabaseUri(): string {
    return "";
  }

  public getEmbeddingModel(): { provider: EmbeddingProviderType; model: EmbeddingModelType["model"] } {
    return { provider: "openai" as EmbeddingProviderType, model: "text-embedding-ada-002" };
  }

  public getSchema(): { [K in keyof DataType]: FieldValueType } {
    return {} as { [K in keyof DataType]: FieldValueType };
  }
}
