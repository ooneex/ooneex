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
    const { role } = user;

    if (role === ERole.SYSTEM) {
      this.allow("manage", "all");
      return this;
    }

    if (role === ERole.SUPER_ADMIN) {
      this.allow("manage", "all");
      return this;
    }

    if (role === ERole.ADMIN) {
      this.allow("manage", "all");
      return this;
    }

    if (role === ERole.USER) {
      this.allow(["read", "update"], ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });
      return this;
    }

    // Member and subscriber roles
    if (role === ERole.MEMBER) {
      this.allow(["read", "update"], ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });

      return this;
    }
    if (role === ERole.SUBSCRIBER) {
      this.allow("read", ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });
      return this;
    }

    if (role === ERole.TRIAL_USER) {
      this.allow("read", ["User", "AuthUser"], { id: user.id });
      return this;
    }

    if (role === ERole.SUSPENDED) {
      this.allow("read", ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { id: user.id });
      return this;
    }

    if (role === ERole.GUEST) {
      this.allow("read", ["UserEntity", "AuthUserEntity", "User", "AuthUser"], { public: true });
      return this;
    }

    return this;
  }
}
