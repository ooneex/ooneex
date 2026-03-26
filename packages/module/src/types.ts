import type { ControllerClassType } from "@ooneex/controller";
import type { CronClassType } from "@ooneex/cron";
import type { EntityClassType } from "@ooneex/entity";
import type { MiddlewareClassType } from "@ooneex/middleware";
import type { PermissionClassType } from "@ooneex/permission";
import type { PubSubClassType } from "@ooneex/pub-sub";

export type ModuleType = {
  controllers: ControllerClassType[];
  entities: EntityClassType[];
  permissions?: PermissionClassType[];

  middlewares?: MiddlewareClassType[];
  cronJobs?: CronClassType[];
  events?: PubSubClassType[];
};
