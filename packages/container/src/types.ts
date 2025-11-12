export enum EContainerScope {
  Singleton = "singleton",
  Transient = "transient",
  Request = "request",
}

export interface IContainer {
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  add(target: new (...args: any[]) => any, scope?: EContainerScope): void;
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  get<T>(target: new (...args: any[]) => T): T;
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  has(target: new (...args: any[]) => any): boolean;
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  remove(target: new (...args: any[]) => any): void;
  addConstant<T>(identifier: string | symbol, value: T): void;
  getConstant<T>(identifier: string | symbol): T;
  hasConstant(identifier: string | symbol): boolean;
  removeConstant(identifier: string | symbol): void;
}
