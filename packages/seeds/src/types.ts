// biome-ignore lint/suspicious/noExplicitAny: trust me
export type SeedClassType = new (...args: any[]) => ISeed;

export interface ISeed {
  get: <T>() => Promise<T>;
}
