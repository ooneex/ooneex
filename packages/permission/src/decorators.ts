import { container, EContainerScope, injectable } from "@ooneex/container";
import type { PermissionClassType } from "./types";

export const decorator = {
  permission: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: PermissionClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
