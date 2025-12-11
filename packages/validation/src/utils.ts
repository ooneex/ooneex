import * as A from "arktype";
import type { TypeParser } from "arktype/internal/type.ts";

// biome-ignore lint/complexity/noBannedTypes: trust me
export const Assert: TypeParser<{}> = A.type;
