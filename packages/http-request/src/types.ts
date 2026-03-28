/** biome-ignore-all lint/suspicious/noExplicitAny: trust me */
import type { Header, IUserAgent } from "@ooneex/http-header";
import type { IRequestFile } from "@ooneex/http-request-file";
import type { LocaleInfoType, LocaleType } from "@ooneex/translation";
import type { HttpMethodType, ScalarType } from "@ooneex/types";
import type { IUrl } from "@ooneex/url";

export type RequestQueriesType = Record<string, ScalarType> & {
  lang?: LocaleType;
  page?: number;
  limit?: number;
  order?: "ASC" | "DESC";
  orderBy?: string;
  q?: string;
};

export type RequestConfigType = {
  params: Record<string, ScalarType>;
  payload: Record<string, unknown>;
  queries: RequestQueriesType;
};

export interface IRequest<Config extends RequestConfigType = RequestConfigType> {
  readonly native: Readonly<Request>;
  readonly path: string;
  readonly url: IUrl;
  readonly method: HttpMethodType;
  readonly header: Header;
  readonly userAgent: IUserAgent | null;
  readonly params: Config["params"];
  readonly payload: Config["payload"];
  readonly queries: Config["queries"];
  readonly form: FormData | null;
  readonly files: Record<string, IRequestFile>;
  readonly ip: string | null;
  readonly host: string;
  readonly language: LocaleInfoType;
}
