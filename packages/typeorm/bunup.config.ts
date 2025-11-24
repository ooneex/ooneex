import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  entry: [
    "src/entities/book/index.ts",
    "src/entities/common/index.ts",
    "src/entities/image/index.ts",
    "src/entities/payment/index.ts",
    "src/entities/video/index.ts",
    "src/entities/gamification/index.ts",
    "src/entities/gamification/flashcard/index.ts",
    "src/entities/gamification/mcq/index.ts",

    "src/repositories/book/index.ts",
    "src/repositories/common/index.ts",
    "src/repositories/image/index.ts",
    "src/repositories/payment/index.ts",
    "src/repositories/video/index.ts",
    "src/repositories/gamification/index.ts",
    "src/repositories/gamification/flashcard/index.ts",
    "src/repositories/gamification/mcq/index.ts",
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
  plugins: [copy(["README.md", "../../LICENSE", "package.json"])],
});
