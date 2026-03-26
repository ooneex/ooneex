import type { ControllerClassType } from "@ooneex/controller";
import type { EntityClassType } from "@ooneex/entity";
import type { PermissionClassType } from "@ooneex/permission";
import type { PubSubClassType } from "@ooneex/pub-sub";
import type { CronClassType } from "@ooneex/cron";

export type ModuleType = {
  controllers: ControllerClassType[];
  entities: EntityClassType[];
  permissions?: PermissionClassType[];
  cronJobs?: CronClassType[]
  events?: PubSubClassType[];
};
