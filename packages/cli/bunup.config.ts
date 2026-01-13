import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  target: "bun",
  format: ["esm"],
  drop: ["console", "debugger"],
  packages: "bundle",
  sourcemap: "external",
  exports: true,
  minify: true,
  dts: {
    minify: false,
  },
  plugins: [copy(["../../LICENSE"]).to("../")],
});
