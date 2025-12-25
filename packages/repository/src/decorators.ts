import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { RepositoryClassType } from "./types";

export const decorator = {
  repository: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: RepositoryClassType): void => {
      if (!target.name.endsWith("Repository")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Repository"`);
      }
      container.add(target, scope);
    };
  },
};
