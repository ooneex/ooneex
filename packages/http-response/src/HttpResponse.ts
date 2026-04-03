import { Environment, type EnvironmentNameType } from "@ooneex/app-env";
import { Header, type IHeader } from "@ooneex/http-header";
import { HttpStatus, type StatusCodeType } from "@ooneex/http-status";
import type { IResponse, ResponseDataType } from "./types";

export class HttpResponse<Data extends Record<string, unknown> = Record<string, unknown>> implements IResponse<Data> {
  public readonly header: IHeader;
  private key: string | null = null;
  private data: Data | null = null;
  private status: StatusCodeType = HttpStatus.Code.OK;
  private redirectUrl: string | URL | null = null;
  private message: string | null = null;
  public done = false; // For socket

  constructor(header?: IHeader) {
    this.header = header || new Header();
  }

  public json(data: Data, status: StatusCodeType = HttpStatus.Code.OK): IResponse<Data> {
    this.key = null;
    this.data = data;
    this.status = status;
    this.header.setJson();
    this.header.remove("Location");
    this.redirectUrl = null;
    this.message = null;

    return this;
  }

  public exception(
    message: string,
    config?: {
      key?: string;
      data?: Data;
      status?: StatusCodeType;
    },
  ): IResponse<Data> {
    this.key = config?.key || null;
    this.message = message;
    this.status = config?.status ?? HttpStatus.Code.InternalServerError;
    this.data = config?.data || null;
    this.redirectUrl = null;
    this.header.setJson();
    this.header.remove("Location");

    return this;
  }

  public notFound(
    message: string,
    config?: {
      key?: string;
      data?: Data;
      status?: StatusCodeType;
    },
  ): IResponse<Data> {
    this.key = config?.key || "NOT_FOUND";
    this.message = message;
    this.status = config?.status || HttpStatus.Code.NotFound;
    this.data = config?.data || null;
    this.redirectUrl = null;
    this.header.setJson();
    this.header.remove("Location");

    return this;
  }

  public redirect(url: string | URL, status: StatusCodeType = HttpStatus.Code.Found): IResponse<Data> {
    this.key = null;
    this.redirectUrl = url;
    this.status = status;
    this.header.setLocation(url.toString());
    this.data = null;
    this.message = null;

    return this;
  }

  public getData(): Data | null {
    return this.data;
  }

  public getStatus(): StatusCodeType {
    return this.status;
  }

  public get(env?: EnvironmentNameType): Response {
    if (this.redirectUrl) {
      return new Response(null, {
        status: this.status,
        headers: this.header.native,
      });
    }

    const status = new HttpStatus();

    const responseData: ResponseDataType<Data> = {
      key: this.key || null,
      data: this.data || ({} as Data),
      message: this.message,
      success: status.isSuccessful(this.status),
      done: this.done,
      status: this.status,
      isClientError: status.isClientError(this.status),
      isServerError: status.isServerError(this.status),
      isNotFound: false,
      isUnauthorized: false,
      isForbidden: false,
      app: {
        env: env || Environment.PRODUCTION,
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: responseData.status,
      headers: this.header.native,
    });
  }
}
