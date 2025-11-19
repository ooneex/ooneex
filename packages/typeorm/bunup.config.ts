import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  entry: ["src/index.ts", "src/books.ts", "src/payment.ts", "src/videos.ts"],
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
