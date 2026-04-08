/** biome-ignore-all lint/suspicious/noExplicitAny: trust me */

import { Container as InversifyContainer, injectable } from "inversify";
import { ContainerException } from "./ContainerException";
import { EContainerScope, type IContainer } from "./types";

// Shared DI container instance across all Container instances
const sharedDI = new InversifyContainer();

export class Container implements IContainer {
  private alias: Record<string, any> = {};

  public add(target: new (...args: any[]) => any, scope: EContainerScope = EContainerScope.Singleton): void {
    try {
      sharedDI.unbind(target);
    } catch {}

    try {
      injectable()(target);
    } catch {}

    const binding = sharedDI.bind(target).toSelf();

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
          throw new ContainerException(`Failed to resolve alias: ${target}`, "ALIAS_RESOLVE_FAILED");
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
      return sharedDI.get<T>(resolvedTarget as new (...args: any[]) => T);
    } catch (e) {
      throw new ContainerException(
        `Failed to resolve dependency: ${typeof target === "string" ? target : target.name}. ${e instanceof Error ? e.message : String(e)}`,
        "SERVICE_RESOLVE_FAILED",
      );
    }
  }

  public has(target: (new (...args: any[]) => unknown) | string): boolean {
    const resolvedTarget = this.resolveAlias(target, false);
    if (resolvedTarget === null) {
      return false;
    }
    return sharedDI.isBound(resolvedTarget);
  }

  public remove(target: (new (...args: unknown[]) => unknown) | string): void {
    const resolvedTarget = this.resolveAlias(target, true);
    if (resolvedTarget && sharedDI.isBound(resolvedTarget)) {
      sharedDI.unbind(resolvedTarget);
    }
  }

  public addConstant<T>(identifier: string | symbol, value: T): void {
    try {
      sharedDI.unbind(identifier);
    } catch {}

    sharedDI.bind<T>(identifier).toConstantValue(value);
  }

  public getConstant<T>(identifier: string | symbol): T {
    try {
      return sharedDI.get<T>(identifier);
    } catch (_e) {
      throw new ContainerException(`Failed to resolve constant: ${identifier.toString()}`, "CONSTANT_RESOLVE_FAILED");
    }
  }

  public hasConstant(identifier: string | symbol): boolean {
    return sharedDI.isBound(identifier);
  }

  public removeConstant(identifier: string | symbol): void {
    if (sharedDI.isBound(identifier)) {
      sharedDI.unbind(identifier);
    }
  }

  public addAlias<T>(alias: string, target: new (...args: any[]) => T): void {
    this.alias[alias] = target;
  }
}

export const container: Container = new Container();
