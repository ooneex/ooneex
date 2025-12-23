import type { ControllerClassType } from "@ooneex/controller";
import type { CronClassType } from "@ooneex/cron";
import type { EntityClassType } from "@ooneex/entity";

export type ModuleType = {
  controllers: ControllerClassType[];
  cronJobs: CronClassType[];
  entities: EntityClassType[];
};
