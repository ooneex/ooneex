import { describe, expect, test } from "bun:test";
import { Convertor } from "../src";

const outputDir = "tests/tmp";

describe("Convertor", () => {
  test("should convert file-sample.pdf to markdown", async () => {
    const convertor = new Convertor("tests/file-sample.pdf");
    const results = [];

    for await (const result of convertor.convert({ outputDir, quiet: true })) {
      expect(result.page).toBeNumber();
      expect(result.content.name).toEndWith(".md");

      const file = Bun.file(result.content.path);
      expect(await file.exists()).toBe(true);

      const content = await file.text();
      expect(content.length).toBeGreaterThan(0);

      results.push(result);
    }

    expect(results.length).toBe(4);
  }, 30_000);
});
