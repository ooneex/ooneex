import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  entry: ["src/index.ts", "src/medecine/index.ts"],
  target: "browser",
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
