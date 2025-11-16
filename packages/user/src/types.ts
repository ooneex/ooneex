import type { ERole } from "@ooneex/role";
import type { IBase } from "@ooneex/types";

export interface IUser extends IBase {
  id: string;
  email: string;
  name: string;
  lastName: string;
  firstName: string;
  roles: ERole[];
}
