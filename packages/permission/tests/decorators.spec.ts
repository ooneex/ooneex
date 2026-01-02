import { beforeEach, describe, expect, test } from "bun:test";
import type { MongoQuery } from "@casl/ability";
import { Container, EContainerScope } from "@ooneex/container";
import type { IUser } from "@ooneex/user";
import { decorator } from "@/decorators";
import type { IPermission, PermissionActionType } from "@/types";

describe("decorator.permission", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  test("should register class ending with 'Permission' successfully", () => {
    class TestPermission implements IPermission {
      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    expect(() => {
      decorator.permission()(TestPermission);
    }).not.toThrow();
  });

  test("should register class with default singleton scope", () => {
    class SingletonPermission implements IPermission {
      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    decorator.permission()(SingletonPermission);

    const instance1 = container.get(SingletonPermission);
    const instance2 = container.get(SingletonPermission);

    expect(instance1).toBe(instance2);
  });

  test("should register class with explicit singleton scope", () => {
    class ExplicitSingletonPermission implements IPermission {
      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    decorator.permission(EContainerScope.Singleton)(ExplicitSingletonPermission);

    const instance1 = container.get(ExplicitSingletonPermission);
    const instance2 = container.get(ExplicitSingletonPermission);

    expect(instance1).toBe(instance2);
  });

  test("should register class with transient scope", () => {
    class TransientPermission implements IPermission {
      private static instanceCount = 0;
      public readonly instanceId: number;

      constructor() {
        TransientPermission.instanceCount++;
        this.instanceId = TransientPermission.instanceCount;
      }

      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    decorator.permission(EContainerScope.Transient)(TransientPermission);

    const instance1 = container.get(TransientPermission);
    const instance2 = container.get(TransientPermission);

    expect(instance1).not.toBe(instance2);
    expect(instance1.instanceId).not.toBe(instance2.instanceId);
  });

  test("should register class with request scope", () => {
    class RequestScopedPermission implements IPermission {
      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    expect(() => {
      decorator.permission(EContainerScope.Request)(RequestScopedPermission);
    }).not.toThrow();

    const instance = container.get(RequestScopedPermission);
    expect(instance).toBeInstanceOf(RequestScopedPermission);
  });

  test("should register class with complex name ending in 'Permission'", () => {
    class UserRoleBasedAccessPermission implements IPermission {
      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    expect(() => {
      decorator.permission()(UserRoleBasedAccessPermission);
    }).not.toThrow();
  });

  test("should allow retrieving registered Permission class from container", () => {
    class RetrievablePermission implements IPermission {
      public readonly name = "retrievable";

      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    decorator.permission()(RetrievablePermission);

    const instance = container.get(RetrievablePermission);
    expect(instance).toBeInstanceOf(RetrievablePermission);
    expect(instance.name).toBe("retrievable");
  });

  test("should work with Permission class that has custom subjects", () => {
    class CustomSubjectPermission implements IPermission {
      public allow(
        _action: PermissionActionType | PermissionActionType[],
        _subject: string | string[],
        _conditions?: MongoQuery<Record<string, unknown>>,
      ): IPermission {
        return this;
      }
      public forbid(
        _action: PermissionActionType | PermissionActionType[],
        _subject: string | string[],
        _conditions?: MongoQuery<Record<string, unknown>>,
      ): IPermission {
        return this;
      }
      public build(): IPermission {
        return this;
      }
      public can(_action: PermissionActionType, _subject: string, _field?: string): boolean {
        return true;
      }
      public cannot(_action: PermissionActionType, _subject: string, _field?: string): boolean {
        return false;
      }
      public setUserPermissions(_user: IUser | null): IPermission {
        return this;
      }
    }

    expect(() => {
      decorator.permission()(CustomSubjectPermission);
    }).not.toThrow();

    const instance = container.get(CustomSubjectPermission);
    expect(instance).toBeInstanceOf(CustomSubjectPermission);
  });

  test("should work with Permission class that implements full interface", () => {
    class FullPermission implements IPermission {
      private permissions: Map<string, boolean> = new Map();

      public allow(
        action: PermissionActionType | PermissionActionType[],
        subject: string | string[],
        _conditions?: MongoQuery<Record<string, unknown>>,
      ): IPermission {
        const actions = Array.isArray(action) ? action : [action];
        const subjects = Array.isArray(subject) ? subject : [subject];
        for (const a of actions) {
          for (const s of subjects) {
            this.permissions.set(`${a}:${s}`, true);
          }
        }
        return this;
      }

      public forbid(
        action: PermissionActionType | PermissionActionType[],
        subject: string | string[],
        _conditions?: MongoQuery<Record<string, unknown>>,
      ): IPermission {
        const actions = Array.isArray(action) ? action : [action];
        const subjects = Array.isArray(subject) ? subject : [subject];
        for (const a of actions) {
          for (const s of subjects) {
            this.permissions.set(`${a}:${s}`, false);
          }
        }
        return this;
      }

      public build(): IPermission {
        return this;
      }

      public can(action: PermissionActionType, subject: string, _field?: string): boolean {
        return this.permissions.get(`${action}:${subject}`) ?? false;
      }

      public cannot(action: PermissionActionType, subject: string, _field?: string): boolean {
        return !this.can(action, subject);
      }

      public setUserPermissions(_user: IUser | null): IPermission {
        return this;
      }
    }

    expect(() => {
      decorator.permission()(FullPermission);
    }).not.toThrow();

    const instance = container.get(FullPermission);
    expect(instance).toBeInstanceOf(FullPermission);
  });

  test("should return void from the decorator function", () => {
    class VoidReturnPermission implements IPermission {
      public allow(): this {
        return this;
      }
      public forbid(): this {
        return this;
      }
      public build(): this {
        return this;
      }
      public can(): boolean {
        return true;
      }
      public cannot(): boolean {
        return false;
      }
      public setUserPermissions(): this {
        return this;
      }
    }

    const result = decorator.permission()(VoidReturnPermission);
    expect(result).toBeUndefined();
  });
});
