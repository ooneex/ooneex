import type { ERole } from "@ooneex/role";

export interface IUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  firstName: string;
  roles: ERole[];
}
