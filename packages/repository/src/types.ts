import type { FilterResultType } from "@ooneex/types";

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type RepositoryClassType = new (...args: any[]) => IRepository;

export interface IRepository<T = unknown, TCriteria = unknown, TSaveOptions = unknown, TDeleteResult = unknown> {
  open: () => Promise<unknown>;
  close: () => Promise<void>;
  find: (criteria: TCriteria & { page?: number; limit?: number; q?: string }) => Promise<FilterResultType<T>>;
  findOne: (id: string) => Promise<T | null>;
  findOneBy: (criteria: TCriteria) => Promise<T | null>;
  create: (entity: T, options?: TSaveOptions) => Promise<T>;
  createMany: (entities: T[], options?: TSaveOptions) => Promise<T[]>;
  update: (entity: T, options?: TSaveOptions) => Promise<T>;
  updateMany: (entities: T[], options?: TSaveOptions) => Promise<T[]>;
  delete: (criteria: TCriteria | TCriteria[]) => Promise<TDeleteResult>;
  count: (criteria?: TCriteria | TCriteria[]) => Promise<number>;
}
