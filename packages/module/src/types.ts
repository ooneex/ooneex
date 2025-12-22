import type { ControllerClassType } from "@ooneex/controller";
import type { EntityClassType } from "@ooneex/entity";

export type ModuleType = {
  controllers: ControllerClassType[];
  entities: EntityClassType[];
};
