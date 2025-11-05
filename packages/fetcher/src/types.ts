import type { Header, HeaderFieldType, ReadonlyHeader } from "@ooneex/http-header";

export type FetcherResponseType<T = unknown> = {
  data: T | null;
  message: string | null;
  header: ReadonlyHeader;
  isInformational: boolean;
  isSuccessful: boolean;
  isRedirect: boolean;
  isClientError: boolean;
  isServerError: boolean;
  isError: boolean;
};

export interface IFetcher {
  readonly header: Header;

  setBearerToken(token: string): IFetcher;
  setBasicToken(token: string): IFetcher;
  clearBearerToken(): IFetcher;
  clearBasicToken(): IFetcher;
  setContentType(contentType: HeaderFieldType): IFetcher;
  setAccept(mimeType: string): IFetcher;
  setAcceptJson(): IFetcher;
  setLang(lang: string): IFetcher;
  abort(): IFetcher;
  clone(): IFetcher;

  get<T = unknown>(path: string): Promise<FetcherResponseType<T>>;
  post<T = unknown>(path: string, data?: unknown): Promise<FetcherResponseType<T>>;
  put<T = unknown>(path: string, data?: unknown): Promise<FetcherResponseType<T>>;
  patch<T = unknown>(path: string, data?: unknown): Promise<FetcherResponseType<T>>;
  delete<T = unknown>(path: string): Promise<FetcherResponseType<T>>;
  head<T = unknown>(path: string): Promise<FetcherResponseType<T>>;
  options<T = unknown>(path: string): Promise<FetcherResponseType<T>>;
  request<T = unknown>(method: string, path: string, data?: unknown): Promise<FetcherResponseType<T>>;
  upload<T = unknown>(path: string, file: File | Blob, name?: string): Promise<FetcherResponseType<T>>;
}
