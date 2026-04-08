import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  target: "bun",
  format: ["esm"],
  drop: ["console", "debugger"],
  packages: "bundle",
  external: [
    "@ooneex/command",
    "@ooneex/logger",
    "@ooneex/migrations",
    "@ooneex/seeds",
    "@ooneex/utils",
    "@ooneex/validation",
  ],
  sourcemap: "external",
  exports: true,
  minify: false,
  dts: {
    minify: false,
  },
  plugins: [copy(["../../LICENSE"]).to("../")],
});
