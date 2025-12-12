import type { AnalyticsClassType } from "@ooneex/analytics";
import type { CacheClassType } from "@ooneex/cache";
import type { CronClassType } from "@ooneex/cron";
import type { DatabaseClassType } from "@ooneex/database";
import type { LoggerClassType } from "@ooneex/logger";
import type { MailerClassType } from "@ooneex/mailer";
import type { MiddlewareClassType } from "@ooneex/middleware";
import type { PermissionClassType } from "@ooneex/permission";
import type { RepositoryClassType } from "@ooneex/repository";
import type { SeedClassType } from "@ooneex/seeds";
import type { ServiceClassType } from "@ooneex/service";
import type { StorageClassType } from "@ooneex/storage";
import { container } from "./Container";
import { ContainerException } from "./ContainerException";
import { EContainerScope } from "./types";

export const decorator = {
  analytics: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: AnalyticsClassType): void => {
      if (!target.name.endsWith("Analytics") && !target.name.endsWith("AnalyticsAdapter")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Analytics" or "AnalyticsAdapter"`);
      }
      container.add(target, scope);
    };
  },
  service: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: ServiceClassType): void => {
      if (!target.name.endsWith("Service")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Service"`);
      }
      container.add(target, scope);
    };
  },
  cache: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: CacheClassType): void => {
      if (!target.name.endsWith("Cache")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Cache"`);
      }
      container.add(target, scope);
    };
  },
  database: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: DatabaseClassType): void => {
      if (!target.name.endsWith("Database")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Database"`);
      }
      container.add(target, scope);
    };
  },
  logger: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: LoggerClassType): void => {
      if (!target.name.endsWith("Logger")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Logger"`);
      }
      container.add(target, scope);
    };
  },
  mailer: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MailerClassType): void => {
      if (!target.name.endsWith("Mailer") && !target.name.endsWith("MailerAdapter")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Mailer" or "MailerAdapter"`);
      }
      container.add(target, scope);
    };
  },
  middleware: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MiddlewareClassType): void => {
      if (!target.name.endsWith("Middleware")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Middleware"`);
      }
      container.add(target, scope);
    };
  },
  repository: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: RepositoryClassType): void => {
      if (!target.name.endsWith("Repository")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Repository"`);
      }
      container.add(target, scope);
    };
  },
  storage: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: StorageClassType): void => {
      if (!target.name.endsWith("Storage")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Storage"`);
      }
      container.add(target, scope);
    };
  },
  cron: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: CronClassType): void => {
      if (!target.name.endsWith("Cron")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Cron"`);
      }
      container.add(target, scope);

      // Create own container
    };
  },
  seed: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: SeedClassType): void => {
      if (!target.name.endsWith("Seed")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Seed"`);
      }
      container.add(target, scope);

      // Create own container
    };
  },
  permission: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: PermissionClassType): void => {
      if (!target.name.endsWith("Permission")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Permission"`);
      }
      container.add(target, scope);
    };
  },
};
