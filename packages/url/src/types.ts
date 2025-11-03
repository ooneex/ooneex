export interface IUrl {
  readonly protocol: string;
  readonly subdomain: string | null;
  readonly domain: string;
  readonly hostname: string;
  readonly port: number;
  readonly path: string;
  readonly queries: Record<string, boolean | number | bigint | string>;
  readonly fragment: string;
  readonly base: string;
  readonly origin: string;
  readonly native: URL;
}
