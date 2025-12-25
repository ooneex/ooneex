import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "./types";

export const decorator = {
  middleware: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MiddlewareClassType | SocketMiddlewareClassType): void => {
      if (!target.name.endsWith("Middleware")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Middleware"`);
      }
      container.add(target, scope);
    };
  },
};
