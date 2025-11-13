import type { EntityTarget, ObjectLiteral, Repository } from "typeorm";

export interface IDatabase {
  open: () => Promise<void>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}

export interface ITypeormDatabaseAdapter {
  open: <Entity extends ObjectLiteral>(entity: EntityTarget<Entity>) => Promise<Repository<Entity>>;
  close: () => Promise<void>;
  drop: () => Promise<void>;
}
