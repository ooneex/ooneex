import { Container as DI } from "inversify";
import { EContainerScope } from "./types";

export const di = new DI();

export class Container {
  // biome-ignore lint/suspicious/noExplicitAny: trust me
  public add(target: new (...args: any[]) => unknown, scope: EContainerScope = EContainerScope.Singleton): void {
    try {
      di.unbind(target);
    } catch {}

    const binding = di.bind(target).toSelf();

    switch (scope) {
      case EContainerScope.Request:
        binding.inRequestScope();
        break;
      case EContainerScope.Transient:
        binding.inTransientScope();
        break;
      default:
        binding.inSingletonScope();
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: trust me
  public get<T>(target: new (...args: any[]) => T): T {
    return di.get<T>(target);
  }

  // biome-ignore lint/suspicious/noExplicitAny: trust me
  public has(target: new (...args: any[]) => unknown): boolean {
    return di.isBound(target);
  }

  public remove(target: new (...args: unknown[]) => unknown): void {
    if (di.isBound(target)) {
      di.unbind(target);
    }
  }

  public addConstant<T>(identifier: string | symbol, value: T): void {
    try {
      di.unbind(identifier);
    } catch {}

    di.bind<T>(identifier).toConstantValue(value);
  }

  public getConstant<T>(identifier: string | symbol): T {
    return di.get<T>(identifier);
  }

  public hasConstant(identifier: string | symbol): boolean {
    return di.isBound(identifier);
  }

  public removeConstant(identifier: string | symbol): void {
    if (di.isBound(identifier)) {
      di.unbind(identifier);
    }
  }
}
