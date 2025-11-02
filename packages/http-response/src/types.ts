import type { IHeader } from "@ooneex/http-header";
import type { StatusCodeType } from "@ooneex/http-status";

export interface IResponse<DataType extends Record<string, unknown> = Record<string, unknown>> {
  readonly header: IHeader;
  json: (data: DataType, status?: StatusCodeType) => IResponse<DataType>;
  exception: (
    message: string,
    config?: {
      data?: DataType;
      status?: StatusCodeType;
    },
  ) => IResponse<DataType>;
  notFound: (
    message: string,
    config?: {
      data?: DataType;
      status?: StatusCodeType;
    },
  ) => IResponse<DataType>;
  redirect: (url: string | URL, status?: StatusCodeType) => IResponse<DataType>;
  get: () => Response;
}
