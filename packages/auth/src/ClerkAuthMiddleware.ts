import { inject, injectable } from "@ooneex/container";
import type { ContextConfigType, ContextType } from "@ooneex/controller";
import { HttpStatus } from "@ooneex/http-status";
import { UserRepository } from "@ooneex/typeorm/repositories/user";
import type { IUser } from "@ooneex/user";
import { AuthException } from "./AuthException";
import { ClerkAuth } from "./ClerkAuth";
import type { IAuthMiddleware } from "./types";

@injectable()
export class ClerkAuthMiddleware implements IAuthMiddleware {
  constructor(
    @inject(ClerkAuth) private readonly clerkAuth: ClerkAuth,
    @inject(UserRepository) private readonly userRepository: UserRepository,
  ) {}

  public async handler<T extends ContextConfigType>(context: ContextType<T>): Promise<IUser> {
    const token = context.header.getBearerToken();

    if (!token) {
      throw new AuthException("Authentication required: Missing bearer token", {
        status: HttpStatus.Code.Unauthorized,
      });
    }

    const clerkUser = await this.clerkAuth.getCurrentUser(token);

    if (!clerkUser) {
      throw new AuthException("Authentication failed: Invalid or expired token", {
        status: HttpStatus.Code.Unauthorized,
      });
    }

    const user = await this.userRepository.findOneBy({ key: clerkUser.id });

    if (!user) {
      throw new AuthException("User not found", {
        status: HttpStatus.Code.Unauthorized,
      });
    }

    return user;
  }
}
