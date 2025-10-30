export enum EContainerScope {
  Singleton = "singleton",
  Transient = "transient",
  Request = "request",
}

export interface IContainer {
  add(target: new (...args: unknown[]) => unknown, scope?: EContainerScope): void;
  get<T>(target: new (...args: unknown[]) => T): T;
  has(target: new (...args: unknown[]) => unknown): boolean;
  remove(target: new (...args: unknown[]) => unknown): void;
  addConstant<T>(identifier: string | symbol, value: T): void;
  getConstant<T>(identifier: string | symbol): T;
  hasConstant(identifier: string | symbol): boolean;
  removeConstant(identifier: string | symbol): void;
}
