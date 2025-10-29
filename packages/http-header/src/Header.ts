import type { MimeType } from "@ooneex/http-mimes";
import { ReadonlyHeader } from "./ReadonlyHeader";
import type { CharsetType, HeaderFieldType, IHeader } from "./types";

export class Header extends ReadonlyHeader implements IHeader {
  constructor(headers?: Headers) {
    super(headers || new Headers());
  }

  public setCacheControl(value: string): this {
    return this.add("Cache-Control", value);
  }

  public setEtag(value: string): this {
    return this.add("Etag", value);
  }

  public setAuthorization(value: string): this {
    return this.add("Authorization", value);
  }

  public setBasicAuth(token: string): this {
    return this.add("Authorization", `Basic ${token}`);
  }

  public setBearerToken(token: string): this {
    return this.add("Authorization", `Bearer ${token}`);
  }

  public setBlobType(charset?: CharsetType): this {
    return this.contentType("application/octet-stream", charset);
  }

  public setJsonType(charset?: CharsetType): this {
    this.add("Accept", "application/json");
    this.contentType("application/json", charset);

    return this;
  }

  public setStreamType(charset?: CharsetType): this {
    return this.setBlobType(charset);
  }

  public setFormDataType(charset?: CharsetType): this {
    return this.contentType("multipart/form-data", charset);
  }

  public setFormType(charset?: CharsetType): this {
    return this.contentType("application/x-www-form-urlencoded", charset);
  }

  public setHtmlType(charset?: CharsetType): this {
    return this.contentType("text/html", charset);
  }

  public setTextType(charset?: CharsetType): this {
    return this.contentType("text/plain", charset);
  }

  public contentType(value: MimeType, charset?: CharsetType): this {
    this.native.delete("Content-Type");
    const contentTypeValue = charset ? `${value}; charset=${charset}` : `${value}`;
    this.native.append("Content-Type", contentTypeValue);

    return this;
  }

  public contentDisposition(value: string): this {
    return this.add("Content-Disposition", `${value}`);
  }

  public contentLength(length: number): this {
    return this.add("Content-Length", `${length}`);
  }

  public setCustom(value: string): this {
    return this.add("X-Custom", value);
  }

  public add(name: HeaderFieldType, value: string): this {
    this.native.append(name, value);

    return this;
  }

  public delete(name: HeaderFieldType): this {
    this.native.delete(name);

    return this;
  }

  public set(name: HeaderFieldType, value: string): this {
    this.native.set(name, value);

    return this;
  }
}
