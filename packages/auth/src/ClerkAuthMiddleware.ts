import { inject, injectable } from "@ooneex/container";
import type { ContextConfigType, ContextType } from "@ooneex/controller";
import { HttpStatus } from "@ooneex/http-status";
import type { IMiddleware } from "@ooneex/middleware";
import { ERole } from "@ooneex/role";
import type { IUser } from "@ooneex/user";
import { AuthException } from "./AuthException";
import { ClerkAuth } from "./ClerkAuth";

@injectable()
export class ClerkAuthMiddleware implements IMiddleware {
  constructor(@inject(ClerkAuth) private readonly clerkAuth: ClerkAuth) {}

  public async handler<T extends ContextConfigType>(context: ContextType<T>): Promise<ContextType<T>> {
    const token = context.header.getBearerToken();

    if (!token) {
      throw new AuthException("Authentication required: Missing bearer token", "MISSING_BEARER_TOKEN", {
        status: HttpStatus.Code.Unauthorized,
      });
    }

    const clerkUser = await this.clerkAuth.getCurrentUser(token);

    if (!clerkUser) {
      throw new AuthException("Authentication failed: Invalid or expired token", "INVALID_TOKEN", {
        status: HttpStatus.Code.Unauthorized,
      });
    }

    const primaryEmail = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);

    if (!primaryEmail) {
      throw new AuthException("User has no primary email", "NO_PRIMARY_EMAIL", {
        status: HttpStatus.Code.Unauthorized,
      });
    }

    const user: IUser = {
      id: clerkUser.privateMetadata?.externalId as string,
      externalId: clerkUser.id,
      email: primaryEmail.emailAddress,
      roles: (clerkUser.privateMetadata?.roles as ERole[]) ?? [ERole.USER],
    };

    if (clerkUser.firstName) user.firstName = clerkUser.firstName;
    if (clerkUser.lastName) user.lastName = clerkUser.lastName;
    if (clerkUser.phoneNumbers[0]?.phoneNumber) user.phone = clerkUser.phoneNumbers[0].phoneNumber;
    if (clerkUser.lastActiveAt) user.lastActiveAt = new Date(clerkUser.lastActiveAt);
    if (clerkUser.lastSignInAt) user.lastLoginAt = new Date(clerkUser.lastSignInAt);
    if (clerkUser.imageUrl) user.avatar = clerkUser.imageUrl;
    if (clerkUser.banned) user.isBanned = clerkUser.banned;
    if (clerkUser.locked) user.isLocked = clerkUser.locked;
    if (clerkUser.createdAt) user.createdAt = new Date(clerkUser.createdAt);
    if (clerkUser.updatedAt) user.updatedAt = new Date(clerkUser.updatedAt);

    context.user = user;

    return context;
  }
}
