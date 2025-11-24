// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ConfigClassType = new (...args: any[]) => IConfig;

export interface IConfig {
  get: <T>() => Promise<T>;
}
