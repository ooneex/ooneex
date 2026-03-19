import type { ContextConfigType, ContextType } from "@ooneex/controller";
import type { IUser } from "@ooneex/user";

export type ClerkAuthConfigType = {
  secretKey?: string;
};

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AuthMiddlewareClassType = new (...args: any[]) => IAuthMiddleware;

export interface IAuthMiddleware<T extends ContextConfigType = ContextConfigType> {
  handler: (context: ContextType<T>) => Promise<IUser> | IUser;
}
