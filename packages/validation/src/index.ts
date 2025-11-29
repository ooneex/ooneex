import * as A from "arktype";
import type { TypeParser } from "arktype/internal/type.ts";

// biome-ignore lint/complexity/noBannedTypes: trust me
export const Assert: TypeParser<{}> = A.type;
export type AssertType = A.Type;
export * from "arktype";
export * from "./types";
