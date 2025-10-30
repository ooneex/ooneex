import type { StatusCodeType } from "@ooneex/http-status";

export type ExceptionStackFrameType = {
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  source: string;
};

export interface IException<T = unknown> {
  readonly date: Date;
  readonly status?: StatusCodeType;
  readonly data?: Readonly<Record<string, T>>;
  readonly native?: Error;
  readonly message: string;
  readonly name: string;
  readonly stack?: string;
  stackToJson: () => ExceptionStackFrameType[] | null;
}
