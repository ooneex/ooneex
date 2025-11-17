/** biome-ignore-all lint/suspicious/noExplicitAny: trust me */

import * as inversify from "inversify";
import { ContainerException } from "./ContainerException";
import { EContainerScope } from "./types";

export const di: inversify.Container = new inversify.Container();

export class Container {
  private alias: Record<string, any> = {};

  public add(target: new (...args: any[]) => any, scope: EContainerScope = EContainerScope.Singleton): void {
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

  private resolveAlias<T>(
    target: (new (...args: any[]) => T) | string,
    throwOnMissing = true,
  ): (new (...args: any[]) => T) | null {
    if (typeof target === "string") {
      const aliasedTarget = this.alias[target];
      if (!aliasedTarget) {
        if (throwOnMissing) {
          throw new ContainerException(`Failed to resolve alias: ${target}`);
        }
        return null;
      }
      return aliasedTarget as new (
        ...args: any[]
      ) => T;
    }
    return target as new (
      ...args: any[]
    ) => T;
  }

  public get<T>(target: (new (...args: any[]) => T) | string): T {
    const resolvedTarget = this.resolveAlias(target, true);

    try {
      return di.get<T>(resolvedTarget as new (...args: any[]) => T);
    } catch (_e) {
      throw new ContainerException(
        `Failed to resolve dependency: ${typeof target === "string" ? target : target.name}`,
      );
    }
  }

  public has(target: (new (...args: any[]) => unknown) | string): boolean {
    const resolvedTarget = this.resolveAlias(target, false);
    if (resolvedTarget === null) {
      return false;
    }
    return di.isBound(resolvedTarget);
  }

  public remove(target: (new (...args: unknown[]) => unknown) | string): void {
    const resolvedTarget = this.resolveAlias(target, true);
    if (resolvedTarget && di.isBound(resolvedTarget)) {
      di.unbind(resolvedTarget);
    }
  }

  public addConstant<T>(identifier: string | symbol, value: T): void {
    try {
      di.unbind(identifier);
    } catch {}

    di.bind<T>(identifier).toConstantValue(value);
  }

  public getConstant<T>(identifier: string | symbol): T {
    try {
      return di.get<T>(identifier);
    } catch (_e) {
      throw new ContainerException(`Failed to resolve constant: ${identifier.toString()}`);
    }
  }

  public hasConstant(identifier: string | symbol): boolean {
    return di.isBound(identifier);
  }

  public removeConstant(identifier: string | symbol): void {
    if (di.isBound(identifier)) {
      di.unbind(identifier);
    }
  }

  public addAlias<T>(alias: string, target: new (...args: any[]) => T): void {
    this.alias[alias] = target;
  }
}

export const container: Container = new Container();
