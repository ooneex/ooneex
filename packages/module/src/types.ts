import type { ControllerClassType } from "@ooneex/controller";
import type { EntityClassType } from "@ooneex/entity";
import type { PermissionClassType } from "@ooneex/permission";
import type { PubSubClassType } from "@ooneex/pub-sub";

export type ModuleType = {
  controllers: ControllerClassType[];
  entities: EntityClassType[];
  // Run setUserPermissions and build permissions before use
  permissions?: PermissionClassType[];
  // Run subscribe before use
  events?: PubSubClassType[];
};
