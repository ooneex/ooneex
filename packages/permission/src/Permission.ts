import { AbilityBuilder, createMongoAbility, type MongoAbility, type MongoQuery } from "@casl/ability";
import { ERole } from "@ooneex/role";
import type { IUser } from "@ooneex/user";
import { PermissionException } from "./PermissionException";
import type { PermissionActionType, Subjects } from "./types";

export class Permission<S extends string = string> {
  private ability: AbilityBuilder<MongoAbility>;
  private builtAbility: MongoAbility | null = null;

  constructor() {
    this.ability = new AbilityBuilder(createMongoAbility);
  }

  public allow(
    action: PermissionActionType | PermissionActionType[],
    subject: (Subjects | S) | (Subjects | S)[],
    conditions?: MongoQuery<Record<string, unknown>>,
  ): this {
    this.ability.can(action as string, subject, conditions);
    return this;
  }

  public forbid(
    action: PermissionActionType | PermissionActionType[],
    subject: (Subjects | S) | (Subjects | S)[],
    conditions?: MongoQuery<Record<string, unknown>>,
  ): this {
    this.ability.cannot(action as string, subject, conditions);
    return this;
  }

  public build(): this {
    this.builtAbility = this.ability.build();
    return this;
  }

  public can(action: PermissionActionType, subject: Subjects | S, field?: string): boolean {
    if (!this.builtAbility) {
      throw new PermissionException("Permission must be built before checking abilities");
    }
    return this.builtAbility.can(action as string, subject as string, field);
  }

  public cannot(action: PermissionActionType, subject: Subjects | S, field?: string): boolean {
    if (!this.builtAbility) {
      throw new PermissionException("Permission must be built before checking abilities");
    }
    return this.builtAbility.cannot(action as string, subject as string, field);
  }

  public setCommonPermissions(user: IUser): this {
    const { roles } = user;

    // Check for highest privilege roles first
    if (roles.includes(ERole.SYSTEM) || roles.includes(ERole.SUPER_ADMIN) || roles.includes(ERole.ADMIN)) {
      this.allow("manage", "all");
      return this;
    }

    // Apply permissions for each role
    for (const role of roles) {
      if (role === ERole.USER || role === ERole.MEMBER) {
        this.allow(["read", "update"], ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });
      }

      if (role === ERole.SUBSCRIBER) {
        this.allow("read", ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });
      }

      if (role === ERole.TRIAL_USER) {
        this.allow("read", ["User", "AuthUser"], { id: user.id });
      }

      if (role === ERole.SUSPENDED) {
        this.allow("read", ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });
      }

      if (role === ERole.GUEST) {
        this.allow("read", ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { public: true });
      }
    }

    return this;
  }
}
