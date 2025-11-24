// biome-ignore lint/suspicious/noExplicitAny: trust me
export type ModelClassType = new (...args: any[]) => IModel;

export interface IModel {
  get: <T>() => Promise<T>;
}
