// biome-ignore lint/suspicious/noExplicitAny: trust me
export type RepositoryClassType = new (...args: any[]) => IRepository;

export interface IRepository {
  get: <T>() => Promise<T>;
}
