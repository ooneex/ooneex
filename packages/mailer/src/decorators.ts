import { container, EContainerScope, injectable } from "@ooneex/container";
import type { MailerClassType } from "./types";

export const decorator = {
  mailer: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MailerClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
