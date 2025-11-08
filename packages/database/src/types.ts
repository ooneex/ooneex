export interface IRepository<Entity> {
  create: (entity: Entity, options?: unknown) => Promise<Entity>;
  find: (id: string) => Promise<Entity | null>;
  findBy: (criteria: unknown) => Promise<Entity[]>;
  update: (entity: Entity, options?: unknown) => Promise<Entity>;
  delete: <UpdateResult>(criteria: unknown) => Promise<UpdateResult>;
}

export interface IDatabase {
  open: () => Promise<void>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}

export interface ITypeormDatabaseAdapter {
  // biome-ignore lint/suspicious/noExplicitAny: trust me for TypeORM entity types
  open: (entity: any) => Promise<any>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}
