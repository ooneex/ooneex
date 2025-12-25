import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { MailerClassType } from "./types";

export const decorator = {
  mailer: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MailerClassType): void => {
      if (!target.name.endsWith("Mailer")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Mailer"`);
      }
      container.add(target, scope);
    };
  },
};
