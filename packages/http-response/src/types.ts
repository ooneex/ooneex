import type { Environment } from "@ooneex/app-env";
import type { IHeader } from "@ooneex/http-header";
import type { StatusCodeType } from "@ooneex/http-status";

export interface IResponse<DataType extends Record<string, unknown> = Record<string, unknown>> {
  readonly header: IHeader;
  done: boolean; // For socket
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
  get: (env?: Environment) => Response;
  getData: () => DataType | null;
  getStatus: () => StatusCodeType;
}

export type ResponseDataType<Data extends Record<string, unknown>> = {
  data: Data;
  message: string | null;
  success: boolean;
  done: boolean; // For socket
  status: number;
  isClientError: boolean;
  isServerError: boolean;
  isNotFound: boolean;
  isUnauthorized: boolean;
  isForbidden: boolean;
  app: {
    env: Environment;
  };
};
