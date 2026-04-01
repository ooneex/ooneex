import { container, EContainerScope, injectable } from "@ooneex/container";
import type { MiddlewareClassType, SocketMiddlewareClassType } from "./types";

export const decorator = {
  middleware: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MiddlewareClassType | SocketMiddlewareClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
