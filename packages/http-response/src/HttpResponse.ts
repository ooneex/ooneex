import { Header, type IHeader } from "@ooneex/http-header";
import { Status, type StatusCodeType } from "@ooneex/http-status";
import type { IResponse } from "./types";

export class HttpResponse<DataType extends Record<string, unknown> = Record<string, unknown>>
  implements IResponse<DataType>
{
  public readonly header: IHeader;
  private data: DataType | null = null;
  private status: StatusCodeType = Status.Code.OK;
  private redirectUrl: string | URL | null = null;
  private message: string | null = null;
  private isException = false;

  constructor(header?: IHeader) {
    this.header = header || new Header();
  }

  public json(data: DataType, status: StatusCodeType = Status.Code.OK): IResponse<DataType> {
    this.data = data;
    this.status = status;
    this.header.setJson();
    this.header.remove("Location");
    this.isException = false;
    this.redirectUrl = null;
    this.message = null;

    return this;
  }

  public exception(
    message: string,
    config?: {
      data?: DataType;
      status?: StatusCodeType;
    },
  ): IResponse<DataType> {
    this.message = message;
    this.status = config?.status || Status.Code.InternalServerError;
    this.data = config?.data || null;
    this.isException = true;
    this.redirectUrl = null;
    this.header.setJson();
    this.header.remove("Location");

    return this;
  }

  public notFound(
    message: string,
    config?: {
      data?: DataType;
      status?: StatusCodeType;
    },
  ): IResponse<DataType> {
    this.message = message;
    this.status = config?.status || Status.Code.NotFound;
    this.data = config?.data || null;
    this.isException = true;
    this.redirectUrl = null;
    this.header.setJson();
    this.header.remove("Location");

    return this;
  }

  public redirect(url: string | URL, status: StatusCodeType = Status.Code.Found): IResponse<DataType> {
    this.redirectUrl = url;
    this.status = status;
    this.header.setLocation(url.toString());
    this.data = null;
    this.message = null;
    this.isException = false;

    return this;
  }

  public get(): Response {
    if (this.redirectUrl) {
      return new Response(null, {
        status: this.status,
        headers: this.header.native,
      });
    }

    if (this.isException) {
      const errorData = {
        error: true,
        message: this.message,
        status: this.status,
        data: this.data,
      };

      return new Response(JSON.stringify(errorData), {
        status: this.status,
        headers: this.header.native,
      });
    }

    return new Response(this.data ? JSON.stringify(this.data) : null, {
      status: this.status,
      headers: this.header.native,
    });
  }
}
