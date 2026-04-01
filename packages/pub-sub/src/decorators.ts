import { container, EContainerScope, injectable } from "@ooneex/container";
import type { PubSubClassType } from "./types";

export const decorator = {
  pubSub: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: PubSubClassType): void => {
      injectable()(target);
      container.add(target, scope);
      // const pubsub = container.get<IPubSub>(target);
      // pubsub.subscribe();
    };
  },
};
