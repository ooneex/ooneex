import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  target: "bun",
  format: ["esm"],
  drop: ["console", "debugger"],
  packages: "bundle",
  external: [
    "@logtail/node",
    "@ooneex/translation",
    "@ooneex/http-status",
    "@ooneex/exception",
    "@ooneex/validation",
    "@ooneex/seeds",
    "@ooneex/migrations",
    "@ooneex/container",
    "@ooneex/utils",
    "@ooneex/routing",
    "@ooneex/logger",
  ],
  sourcemap: "external",
  exports: true,
  minify: false,
  dts: {
    minify: false,
  },
  plugins: [copy(["../../LICENSE"]).to("../")],
});
