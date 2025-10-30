import type { StatusCodeType } from "@ooneex/http-status";
import type { ExceptionStackFrameType } from "./types";

export class Exception<T = unknown> extends Error {
  public readonly date: Date = new Date();
  public readonly status?: StatusCodeType;
  public readonly data?: Readonly<Record<string, T>>;
  public readonly native?: Error;

  constructor(message: string | Error, options?: { status?: StatusCodeType; data?: Readonly<Record<string, T>> }) {
    super(message instanceof Error ? (message as Error).message : message);

    this.status = options?.status;
    this.data = options?.data;
    this.native = message instanceof Error ? (message as Error) : undefined;
  }

  /**
   * Converts the stack trace into a structured JSON object
   * @returns Array of stack frames or null if no stack trace is available
   */
  public stackToJson(): ExceptionStackFrameType[] | null {
    if (!this.stack) {
      return null;
    }

    const stackLines = this.stack.split("\n");
    const frames: ExceptionStackFrameType[] = [];

    // Skip the first line (error message) and process stack frames
    for (let i = 1; i < stackLines.length; i++) {
      const line = stackLines[i]?.trim();
      if (!line) continue;

      const frame: ExceptionStackFrameType = {
        source: line,
      };

      // Parse common stack trace formats
      // Format: "    at functionName (file:line:column)"
      // Format: "    at file:line:column"
      // Format: "    at functionName (file)"

      const atMatch = line.match(/^\s*at\s+(.+)$/);
      if (atMatch) {
        const content = atMatch[1];

        // Check if it has parentheses (function name with location)
        const funcWithLocationMatch = content?.match(/^(.+?)\s+\((.+)\)$/);
        if (funcWithLocationMatch) {
          frame.functionName = funcWithLocationMatch[1];
          const location = funcWithLocationMatch[2];

          // Parse file:line:column
          const locationMatch = location?.match(/^(.+):(\d+):(\d+)$/);
          if (locationMatch) {
            frame.fileName = locationMatch[1];
            frame.lineNumber = Number.parseInt(locationMatch[2] as string, 10);
            frame.columnNumber = Number.parseInt(locationMatch[3] as string, 10);
          } else {
            frame.fileName = location;
          }
        } else {
          // Direct file:line:column format
          const directLocationMatch = content?.match(/^(.+):(\d+):(\d+)$/);
          if (directLocationMatch) {
            frame.fileName = directLocationMatch[1];
            frame.lineNumber = Number.parseInt(directLocationMatch[2] as string, 10);
            frame.columnNumber = Number.parseInt(directLocationMatch[3] as string, 10);
          } else {
            // Assume it's a function name or location without line numbers
            frame.functionName = content;
          }
        }
      }

      frames.push(frame);
    }

    return frames;
  }
}
