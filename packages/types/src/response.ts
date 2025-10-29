import type { StatusCodeType } from "@ooneex/http-status";

export interface IResponse<DataType extends Record<string, unknown> = Record<string, unknown>> {
  json: (
    data: DataType,
    status?: StatusCodeType,
    charset?: "ISO-8859-1" | "7-BIT" | "UTF-8" | "UTF-16" | "US-ASCII",
  ) => this;
  exception: (
    message: string,
    config?: {
      data?: DataType;
      status?: StatusCodeType;
    },
  ) => void;
  notFound: (
    message: string,
    config?: {
      data?: DataType;
      status?: StatusCodeType;
    },
  ) => void;
  redirect: (url: string | URL, status?: StatusCodeType) => Response;
  get: () => Response;
}
