import { describe, expect, test } from "bun:test";
import { Convertor } from "@/index";

const outputDir = "tests/tmp";

describe("Convertor", () => {
  test("should convert file-sample.pdf and produce section chunks", async () => {
    const convertor = new Convertor("tests/file-sample.pdf");
    const generator = convertor.convert({ outputDir, quiet: true });

    const chunks = [];
    let result = await generator.next();
    while (!result.done) {
      chunks.push(result.value);
      result = await generator.next();
    }
    const files = result.value;

    expect(chunks.length).toBeGreaterThan(0);

    for (const chunk of chunks) {
      expect(chunk.text.length).toBeGreaterThan(0);
      expect(chunk.metadata.pages).toBeArray();
    }

    expect(files.json.name).toEndWith(".json");
    const jsonFile = Bun.file(files.json.path);
    expect(await jsonFile.exists()).toBe(true);

    expect(files.markdown.name).toEndWith(".md");
    const mdFile = Bun.file(files.markdown.path);
    expect(await mdFile.exists()).toBe(true);
  });
});
