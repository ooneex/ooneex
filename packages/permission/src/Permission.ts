import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability";
import type { IUser } from "@ooneex/user";
import { PermissionException } from "./PermissionException";
import type { IPermission, PermissionActionType, Subjects } from "./types";

export abstract class Permission<S extends string = string> implements IPermission<S> {
  protected ability: AbilityBuilder<MongoAbility>;
  private builtAbility: MongoAbility | null = null;

  constructor() {
    this.ability = new AbilityBuilder(createMongoAbility);
  }

  public abstract allow(): this;

  public abstract forbid(): this;

  public abstract setUserPermissions(user: IUser | null): this;

  public abstract check(): Promise<boolean>;

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
}
