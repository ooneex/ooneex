import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { StorageClassType } from "./types";

export const decorator = {
  storage: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: StorageClassType): void => {
      if (!target.name.endsWith("Storage")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Storage"`);
      }
      container.add(target, scope);
    };
  },
};
