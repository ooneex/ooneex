import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  entry: [
    "entities/book/index.ts",
    "entities/common/index.ts",
    "entities/image/index.ts",
    "entities/payment/index.ts",
    "entities/video/index.ts",
    "entities/user/index.ts",
    "entities/gamification/index.ts",
    "entities/gamification/flashcard/index.ts",
    "entities/gamification/mcq/index.ts",

    "repositories/book/index.ts",
    "repositories/common/index.ts",
    "repositories/image/index.ts",
    "repositories/payment/index.ts",
    "repositories/video/index.ts",
    "repositories/user/index.ts",
    "repositories/gamification/index.ts",
    "repositories/gamification/flashcard/index.ts",
    "repositories/gamification/mcq/index.ts",
  ],
  target: "bun",
  format: ["esm"],
  drop: ["console", "debugger"],
  packages: "external",
  sourcemap: "external",
  unused: {
    level: "error",
  },
  exports: true,
  minify: true,
  dts: {
    minify: false,
  },
  plugins: [copy(["../../LICENSE"]).to("../")],
});
