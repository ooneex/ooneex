import { container, EContainerScope } from "@ooneex/container";
import type { IPubSub, PubSubClassType } from "./types";

export const decorator = {
  pubSub: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: PubSubClassType): void => {
      container.add(target, scope);
      const pubsub = container.get<IPubSub>(target);
      pubsub.subscribe();
    };
  },
};
