// biome-ignore lint/suspicious/noExplicitAny: trust me
export type MigrationClassType = new (...args: any[]) => IMigration;

export interface IMigration {
  get: <T>() => Promise<T>;
}
