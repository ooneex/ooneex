import type { LocaleType } from "@ooneex/translation";
import type { ScalarType } from "@ooneex/types";

export interface IReadonlyUrl {
  getNative: () => URL;
  getProtocol: () => string;
  getSubdomain: () => string | null;
  getDomain: () => string;
  getHostname: () => string;
  getPort: () => number;
  getPath: () => string;
  getQueries: () => Record<string, ScalarType>;
  getFragment: () => string;
  getBase: () => string;
  getOrigin: () => string;
  getQuery: (name: string) => ScalarType | null;
  getLang: () => LocaleType;
  getPage: () => number;
  getLimit: () => number;
  getOrder: () => "ASC" | "DESC";
  getOrderBy: () => string | null;
  getSearch: () => string | null;
  toString: () => string;
}

export interface IUrl extends IReadonlyUrl {
  setProtocol: (protocol: string) => IUrl;
  setHostname: (hostname: string) => IUrl;
  setPort: (port: number) => IUrl;
  setPath: (path: string) => IUrl;
  setFragment: (fragment: string) => IUrl;
  addQuery: (key: string, value: ScalarType) => IUrl;
  setQueries: (queries: Record<string, ScalarType>) => IUrl;
  removeQuery: (key: string) => IUrl;
  clearQueries: () => IUrl;
}
