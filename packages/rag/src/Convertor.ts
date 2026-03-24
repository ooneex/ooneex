import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";
import { convert } from "@opendataloader/pdf";
import { PDF } from "@ooneex/pdf";
import { random } from "@ooneex/utils";
import { ConvertorException } from "./ConvertorException";
import type { ConvertorOptionsType, ConvertorPageResultType, IConvertor } from "./types";

/**
 * Converts PDF files to Markdown format using OpenDataLoader PDF
 *
 * @example
 * ```typescript
 * import { Convertor } from "@ooneex/rag";
 *
 * const convertor = new Convertor("path/to/document.pdf");
 * for await (const page of convertor.convert({ outputDir: "path/to/output" })) {
 *   console.log(page);
 * }
 * ```
 */
export class Convertor implements IConvertor {
  private readonly source: string;

  /**
   * Create a new Convertor instance
   * @param source - Path to PDF file or directory containing PDF files
   */
  constructor(source: string) {
    this.source = path.join(...source.split(/[/\\]/));
  }

  /**
   * Convert PDF to markdown format, split by page
   * @param options - Conversion options
   */
  public async *convert(options: ConvertorOptionsType = {}): AsyncGenerator<ConvertorPageResultType, void, unknown> {
    try {
      const subDir = random.nanoid(15);
      const outputDir = options.outputDir ? path.join(options.outputDir, subDir) : subDir;

      const pdf = new PDF(this.source, ...(options.password !== undefined ? [{ password: options.password }] : []));
      const baseConvertOptions = this.buildOptions(options);
      const splitResults = pdf.split({ outputDir });

      for await (const splitResult of splitResults) {
        const pageNum = splitResult.pages.start;
        const pageDir = path.join(outputDir, String(pageNum));
        const imageDir = path.join(pageDir, "images");
        await mkdir(pageDir, { recursive: true });

        await this.convertPage(this.source, pageDir, imageDir, pageNum, baseConvertOptions);

        const pdfFileName = `${random.nanoid(15)}.pdf`;
        await rename(splitResult.path, path.join(pageDir, pdfFileName));

        const [mdFileName, renamedImages] = await Promise.all([
          this.renameOutputMd(pageDir),
          this.renameImages(imageDir),
        ]);

        await this.postProcessMd(pageDir, mdFileName, renamedImages);

        const imageFiles = await readdir(imageDir).catch(() => []);

        yield {
          page: pageNum,
          images: imageFiles.map((name) => ({ name, path: path.join(imageDir, name) })),
          content: { name: mdFileName, path: path.join(pageDir, mdFileName) },
          pdf: { name: pdfFileName, path: path.join(pageDir, pdfFileName) },
        };
      }
    } catch (error) {
      if (error instanceof ConvertorException) throw error;
      throw new ConvertorException(error instanceof Error ? error.message : "PDF conversion failed", {
        source: this.source,
      });
    }
  }

  private async convertPage(
    pdfPath: string,
    outputDir: string,
    imageDir: string,
    pageNum: number,
    baseConvertOptions: Record<string, string | boolean | undefined>,
  ): Promise<void> {
    await convert([pdfPath], {
      ...baseConvertOptions,
      outputDir,
      imageDir,
      imageOutput: "external",
      format: "markdown",
      pages: String(pageNum),
    });
  }

  private async renameOutputMd(outputDir: string): Promise<string> {
    const files = await readdir(outputDir);
    const mdFile = files.find((f) => f.endsWith(".md"));
    const newName = `${random.nanoid(15)}.md`;
    if (mdFile) {
      await rename(path.join(outputDir, mdFile), path.join(outputDir, newName));
    }
    return newName;
  }

  private async renameImages(imageDir: string): Promise<Map<string, string>> {
    const renamedMap = new Map<string, string>();
    const files = await readdir(imageDir).catch(() => []);
    await Promise.all(
      files.map(async (file) => {
        const ext = path.extname(file);
        const newName = `${random.nanoid(15)}${ext}`;
        await rename(path.join(imageDir, file), path.join(imageDir, newName));
        renamedMap.set(file, newName);
      }),
    );
    return renamedMap;
  }

  /**
   * Single-pass post-processing of the generated markdown file:
   * 1. Updates image references to their renamed filenames.
   * 2. Strips the bare page number that @opendataloader/pdf appends as plain
   *    text at the end of each single-page conversion output.
   */
  private async postProcessMd(outputDir: string, mdFileName: string, renamedImages: Map<string, string>): Promise<void> {
    const mdPath = path.join(outputDir, mdFileName);
    const file = Bun.file(mdPath);
    if (!(await file.exists())) return;

    let content = await file.text();

    for (const [oldName, newName] of renamedImages) {
      content = content.replaceAll(oldName, newName);
    }

    // Remove a bare page number (one or more digits, optional surrounding
    // whitespace) that the Java CLI appends at the very end of the output.
    content = content.replace(/\n+\d+\s*$/, "");

    await Bun.write(mdPath, content);
  }

  private buildOptions(
    options: ConvertorOptionsType,
  ): Record<string, string | boolean | undefined> {
    return {
      ...(options.password !== undefined && { password: options.password }),
      ...(options.imageFormat !== undefined && { imageFormat: options.imageFormat }),
      ...(options.quiet !== undefined && { quiet: options.quiet }),
    };
  }
}
