import type { ContextType } from "@ooneex/controller";
import { HttpStatus } from "@ooneex/http-status";
import { ERole } from "@ooneex/role";
import type { RouteValidationError } from "./validation";

export const checkAllowedUsers = (context: ContextType): RouteValidationError | null => {
  if (!context.user) {
    return null;
  }

  const systemUsers = context.env.SYSTEM_USERS;
  if (systemUsers?.includes(context.user.email)) {
    if (!context.user.roles.includes(ERole.SYSTEM)) {
      context.user.roles.push(ERole.SYSTEM);
    }
  }

  const superAdminUsers = context.env.SUPER_ADMIN_USERS;
  if (superAdminUsers?.includes(context.user.email)) {
    if (!context.user.roles.includes(ERole.SUPER_ADMIN)) {
      context.user.roles.push(ERole.SUPER_ADMIN);
    }
  }

  const adminUsers = context.env.ADMIN_USERS;
  if (adminUsers?.includes(context.user.email)) {
    if (!context.user.roles.includes(ERole.ADMIN)) {
      context.user.roles.push(ERole.ADMIN);
    }
  }

  const allowedUsersKey = `${context.env.APP_ENV.toUpperCase()}_ALLOWED_USERS` as keyof typeof context.env;
  const allowedUsers = context.env[allowedUsersKey] as string[] | undefined;

  if (allowedUsers && allowedUsers.length > 0 && !allowedUsers.includes(context.user.email)) {
    return {
      message: `User "${context.user.email}" is not allowed in "${context.env.APP_ENV}" environment`,
      status: HttpStatus.Code.Forbidden,
      key: "USER_NOT_ALLOWED",
    };
  }

  return null;
};
