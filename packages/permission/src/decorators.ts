import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { PermissionClassType } from "./types";

export const decorator = {
  permission: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: PermissionClassType): void => {
      if (!target.name.endsWith("Permission")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Permission"`);
      }
      container.add(target, scope);
    };
  },
};
