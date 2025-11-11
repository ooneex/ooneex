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
