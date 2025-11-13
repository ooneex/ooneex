/** biome-ignore-all lint/suspicious/noExplicitAny: trust me */

export enum EContainerScope {
  Singleton = "singleton",
  Transient = "transient",
  Request = "request",
}

export interface IContainer {
  add: (target: new (...args: any[]) => any, scope?: EContainerScope) => void;
  get: <T>(target: (new (...args: any[]) => T) | string) => T;
  has: (target: (new (...args: any[]) => any) | string) => boolean;
  remove: (target: (new (...args: any[]) => any) | string) => void;
  addConstant: <T>(identifier: string | symbol, value: T) => void;
  getConstant: <T>(identifier: string | symbol) => T;
  hasConstant: (identifier: string | symbol) => boolean;
  removeConstant(identifier: string | symbol): void;
  addAlias<T>(alias: string, target: new (...args: any[]) => T): void;
}
