import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { pdf } from "pdf-to-img";
import { PDFException } from "./PDFException";
import type {
  IPDF,
  PDFAddPageOptionsType,
  PDFAddPageResultType,
  PDFCreateOptionsType,
  PDFCreateResultType,
  PDFMetadataResultType,
  PDFOptionsType,
  PDFPageImageResultType,
  PDFRemovePagesResultType,
  PDFSplitOptionsType,
  PDFSplitResultType,
  PDFToImagesOptionsType,
  PDFUpdateMetadataOptionsType,
} from "./types";

export class PDF implements IPDF {
  private readonly source: string;
  private readonly options: PDFOptionsType;

  /**
   * Create a new PDF instance
   * @param source - Path to PDF file
   * @param options - Options for PDF processing
   */
  constructor(source: string, options: PDFOptionsType = {}) {
    this.source = path.join(...source.split(/[/\\]/));
    this.options = {
      scale: options.scale ?? 3,
      ...(options.password !== undefined && { password: options.password }),
    };
  }

  /**
   * Create a new PDF document and save to the source path
   * @param options - Optional content and metadata options for the PDF document
   * @returns Result containing the page count
   *
   * @example
   * ```typescript
   * // Create a simple empty PDF
   * const pdf = new PDF("/path/to/output.pdf");
   * const result = await pdf.create();
   *
   * // Create a PDF with metadata
   * const pdf = new PDF("/path/to/output.pdf");
   * const result = await pdf.create({
   *   title: "My Document",
   *   author: "John Doe",
   *   subject: "Example PDF",
   *   keywords: ["example", "pdf", "document"],
   *   creator: "My App",
   *   producer: "pdf-lib",
   * });
   * ```
   */
  public async create(options: PDFCreateOptionsType = {}): Promise<PDFCreateResultType> {
    try {
      const pdfDoc = await PDFDocument.create();

      // Set metadata if provided
      if (options.title) {
        pdfDoc.setTitle(options.title);
      }
      if (options.author) {
        pdfDoc.setAuthor(options.author);
      }
      if (options.subject) {
        pdfDoc.setSubject(options.subject);
      }
      if (options.keywords) {
        pdfDoc.setKeywords(options.keywords);
      }
      if (options.producer) {
        pdfDoc.setProducer(options.producer);
      }
      if (options.creator) {
        pdfDoc.setCreator(options.creator);
      }

      const pdfBytes = await pdfDoc.save();

      await Bun.write(this.source, pdfBytes);

      return {
        pageCount: pdfDoc.getPageCount(),
      };
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to create PDF document", {
        source: this.source,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Add a page to an existing PDF document
   * @param options - Optional content options for the page
   * @returns Result containing the total page count
   *
   * @example
   * ```typescript
   * const pdf = new PDF("/path/to/document.pdf");
   *
   * // Add an empty page
   * await pdf.addPage();
   *
   * // Add a page with content
   * await pdf.addPage({
   *   content: "Hello, World!",
   *   fontSize: 24,
   * });
   * ```
   */
  public async addPage(options: PDFAddPageOptionsType = {}): Promise<PDFAddPageResultType> {
    try {
      const sourceBytes = await Bun.file(this.source).arrayBuffer();

      const pdfDoc = await PDFDocument.load(sourceBytes, {
        ignoreEncryption: this.options.password !== undefined,
      });

      const page = pdfDoc.addPage();

      // Add content if provided
      if (options.content) {
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = options.fontSize ?? 12;
        const margin = 50;
        const lineHeight = fontSize * 1.2;

        const { height } = page.getSize();
        let y = height - margin;

        const lines = options.content.split("\n");

        for (const line of lines) {
          if (y < margin) {
            break;
          }

          page.drawText(line, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });

          y -= lineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();

      await Bun.write(this.source, pdfBytes);

      return {
        pageCount: pdfDoc.getPageCount(),
      };
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to add page to PDF", {
        source: this.source,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get metadata from the PDF document
   * @returns PDF metadata including title, author, dates, and page count
   *
   * @example
   * ```typescript
   * const pdf = new PDF("/path/to/document.pdf");
   * const metadata = await pdf.getMetadata();
   *
   * console.log(metadata.title);
   * console.log(metadata.author);
   * console.log(metadata.pageCount);
   * ```
   */
  public async getMetadata(): Promise<PDFMetadataResultType> {
    try {
      const sourceBytes = await Bun.file(this.source).arrayBuffer();

      const pdfDoc = await PDFDocument.load(sourceBytes, {
        ignoreEncryption: this.options.password !== undefined,
        updateMetadata: false,
      });

      return {
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        subject: pdfDoc.getSubject(),
        keywords: pdfDoc.getKeywords(),
        producer: pdfDoc.getProducer(),
        creator: pdfDoc.getCreator(),
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate(),
        pageCount: pdfDoc.getPageCount(),
      };
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to get PDF metadata", {
        source: this.source,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Update metadata of an existing PDF document
   * @param options - Metadata options to update
   *
   * @example
   * ```typescript
   * const pdf = new PDF("/path/to/document.pdf");
   * await pdf.updateMetadata({
   *   title: "Updated Title",
   *   author: "New Author",
   *   subject: "Updated Subject",
   *   keywords: ["updated", "keywords"],
   *   producer: "My App",
   *   creator: "pdf-lib",
   *   creationDate: new Date("2020-01-01"),
   *   modificationDate: new Date(),
   * });
   * ```
   */
  public async updateMetadata(options: PDFUpdateMetadataOptionsType): Promise<void> {
    try {
      const sourceBytes = await Bun.file(this.source).arrayBuffer();

      const pdfDoc = await PDFDocument.load(sourceBytes, {
        ignoreEncryption: this.options.password !== undefined,
      });

      if (options.title !== undefined) {
        pdfDoc.setTitle(options.title);
      }
      if (options.author !== undefined) {
        pdfDoc.setAuthor(options.author);
      }
      if (options.subject !== undefined) {
        pdfDoc.setSubject(options.subject);
      }
      if (options.keywords !== undefined) {
        pdfDoc.setKeywords(options.keywords);
      }
      if (options.producer !== undefined) {
        pdfDoc.setProducer(options.producer);
      }
      if (options.creator !== undefined) {
        pdfDoc.setCreator(options.creator);
      }
      if (options.creationDate !== undefined) {
        pdfDoc.setCreationDate(options.creationDate);
      }
      if (options.modificationDate !== undefined) {
        pdfDoc.setModificationDate(options.modificationDate);
      }

      const pdfBytes = await pdfDoc.save();

      await Bun.write(this.source, pdfBytes);
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to update PDF metadata", {
        source: this.source,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get the total number of pages in the PDF
   */
  public async getPageCount(): Promise<number> {
    try {
      const document = await pdf(this.source, this.options);
      return document.length;
    } catch (error) {
      throw new PDFException("Failed to get page count", {
        source: this.source,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Convert all pages to images and save to disk
   * @param options - Options including output directory and optional prefix
   * @returns Array of page image results with page numbers and file paths
   */
  public async toImages(options: PDFToImagesOptionsType): Promise<PDFPageImageResultType[]> {
    const normalizedOutputDir = path.join(...options.outputDir.split(/[/\\]/));
    const prefix = options.prefix ?? "page";

    try {
      const document = await pdf(this.source, this.options);
      const results: PDFPageImageResultType[] = [];
      let pageNumber = 1;

      for await (const image of document) {
        const fileName = `${prefix}-${pageNumber}.png`;
        const filePath = path.join(normalizedOutputDir, fileName);

        await Bun.write(filePath, Buffer.from(image));

        results.push({
          page: pageNumber,
          path: filePath,
        });
        pageNumber++;
      }

      return results;
    } catch (error) {
      throw new PDFException("Failed to convert PDF to images", {
        source: this.source,
        outputDir: normalizedOutputDir,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Convert a specific page to an image and save to disk
   * @param pageNumber - Page number (1-indexed)
   * @param options - Options including output directory and optional prefix
   * @returns Page image result with page number and file path
   */
  public async getPageImage(pageNumber: number, options: PDFToImagesOptionsType): Promise<PDFPageImageResultType> {
    if (pageNumber < 1 || !Number.isInteger(pageNumber)) {
      throw new PDFException("Page number must be a positive integer", {
        pageNumber,
      });
    }

    const normalizedOutputDir = path.join(...options.outputDir.split(/[/\\]/));
    const prefix = options.prefix ?? "page";

    try {
      const document = await pdf(this.source, this.options);

      if (pageNumber > document.length) {
        throw new PDFException("Page number exceeds total pages", {
          pageNumber,
          totalPages: document.length,
        });
      }

      const image = await document.getPage(pageNumber);

      const fileName = `${prefix}-${pageNumber}.png`;
      const filePath = path.join(normalizedOutputDir, fileName);

      await Bun.write(filePath, Buffer.from(image));

      return {
        page: pageNumber,
        path: filePath,
      };
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to get page image", {
        source: this.source,
        pageNumber,
        outputDir: normalizedOutputDir,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Split the PDF into separate documents and save to disk
   * @param options - Split options with output directory, page ranges, and optional prefix
   * @returns Array of split PDF results with page ranges and file paths
   */
  public async split(options: PDFSplitOptionsType): Promise<PDFSplitResultType[]> {
    const normalizedOutputDir = path.join(...options.outputDir.split(/[/\\]/));
    const prefix = options.prefix ?? "page";

    try {
      const sourceBytes = await Bun.file(this.source).arrayBuffer();

      const sourcePdf = await PDFDocument.load(sourceBytes, {
        ignoreEncryption: this.options.password !== undefined,
      });

      const totalPages = sourcePdf.getPageCount();

      if (totalPages === 0) {
        throw new PDFException("PDF has no pages", {
          source: this.source,
        });
      }

      const ranges = this.normalizeRanges(options.ranges, totalPages);
      const results: PDFSplitResultType[] = [];

      for (const range of ranges) {
        const { start, end } = range;

        if (start < 1 || end > totalPages || start > end) {
          throw new PDFException("Invalid page range", {
            start,
            end,
            totalPages,
          });
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

        for (const page of copiedPages) {
          newPdf.addPage(page);
        }

        const pdfBytes = await newPdf.save();

        const fileName = start === end ? `${prefix}-${start}.pdf` : `${prefix}-${start}-${end}.pdf`;
        const filePath = path.join(normalizedOutputDir, fileName);

        await Bun.write(filePath, pdfBytes);

        results.push({
          pages: { start, end },
          path: filePath,
        });
      }

      return results;
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to split PDF", {
        source: this.source,
        outputDir: normalizedOutputDir,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Remove specified pages from the PDF
   * @param pages - Page numbers to remove (1-indexed). Can be individual numbers or ranges [start, end]
   * @returns Result with remaining page count and PDF buffer
   *
   * @example
   * ```typescript
   * const pdf = new PDF("/path/to/document.pdf");
   *
   * // Remove individual pages (pages 2 and 5)
   * const result1 = await pdf.removePages([2, 5]);
   *
   * // Remove a range of pages (pages 3 to 6)
   * const result2 = await pdf.removePages([[3, 6]]);
   *
   * // Remove mixed: individual pages and ranges (pages 1, 4-6, and 10)
   * const result3 = await pdf.removePages([1, [4, 6], 10]);
   *
   * console.log(result3.remainingPages); // Number of pages left
   * console.log(result3.buffer);         // Buffer containing the resulting PDF
   *
   * // Save to file
   * await Bun.write("/path/to/output.pdf", result3.buffer);
   * ```
   */
  public async removePages(pages: (number | [number, number])[]): Promise<PDFRemovePagesResultType> {
    try {
      const sourceBytes = await Bun.file(this.source).arrayBuffer();

      const pdfDoc = await PDFDocument.load(sourceBytes, {
        ignoreEncryption: this.options.password !== undefined,
      });

      const totalPages = pdfDoc.getPageCount();

      if (totalPages === 0) {
        throw new PDFException("PDF has no pages", {
          source: this.source,
        });
      }

      // Normalize page numbers to remove into a flat sorted array
      const pagesToRemove = this.normalizePageNumbers(pages, totalPages);

      if (pagesToRemove.length === 0) {
        throw new PDFException("No valid pages specified for removal", {
          pages,
        });
      }

      if (pagesToRemove.length >= totalPages) {
        throw new PDFException("Cannot remove all pages from PDF", {
          pagesToRemove,
          totalPages,
        });
      }

      // Remove pages in reverse order to maintain correct indices
      const sortedDescending = [...pagesToRemove].sort((a, b) => b - a);
      for (const pageNum of sortedDescending) {
        pdfDoc.removePage(pageNum - 1); // Convert to 0-indexed
      }

      const pdfBytes = await pdfDoc.save();

      await Bun.write(this.source, pdfBytes);

      return {
        remainingPages: pdfDoc.getPageCount(),
      };
    } catch (error) {
      if (error instanceof PDFException) {
        throw error;
      }
      throw new PDFException("Failed to remove pages from PDF", {
        source: this.source,
        pages,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Normalize page numbers into a flat array of unique valid page numbers
   */
  private normalizePageNumbers(pages: (number | [number, number])[], totalPages: number): number[] {
    const pageSet = new Set<number>();

    for (const page of pages) {
      if (typeof page === "number") {
        if (page >= 1 && page <= totalPages && Number.isInteger(page)) {
          pageSet.add(page);
        }
      } else {
        const [start, end] = page;
        if (start <= end) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            if (Number.isInteger(i)) {
              pageSet.add(i);
            }
          }
        }
      }
    }

    return Array.from(pageSet);
  }

  /**
   * Normalize page ranges for splitting
   * If no ranges provided, creates individual page ranges
   */
  private normalizeRanges(
    ranges: PDFSplitOptionsType["ranges"] | undefined,
    totalPages: number,
  ): { start: number; end: number }[] {
    if (!ranges || ranges.length === 0) {
      return Array.from({ length: totalPages }, (_, i) => ({
        start: i + 1,
        end: i + 1,
      }));
    }

    return ranges.map((range) => {
      if (typeof range === "number") {
        return { start: range, end: range };
      }
      return { start: range[0], end: range[1] };
    });
  }
}
