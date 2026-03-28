import { createClerkClient, type Session, type User, verifyToken } from "@clerk/backend";
import { AppEnv } from "@ooneex/app-env";
import { inject, injectable } from "@ooneex/container";
import { AuthException } from "./AuthException";
import type { ClerkAuthConfigType } from "./types";

@injectable()
export class ClerkAuth {
  private readonly client: ReturnType<typeof createClerkClient>;
  private readonly secretKey: string;

  constructor(@inject(AppEnv) private readonly env: AppEnv, config?: ClerkAuthConfigType) {
    const secretKey = config?.secretKey || this.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      throw new AuthException(
        "Clerk secret key is required. Provide a secret key through config options or set the CLERK_SECRET_KEY environment variable.",
      );
    }

    this.secretKey = secretKey;
    this.client = createClerkClient({
      secretKey,
    });
  }

  public async getCurrentUser(token: string): Promise<User | null> {
    const { sub: userId } = await verifyToken(token, {
      secretKey: this.secretKey,
    });

    if (!userId) {
      return null;
    }

    return await this.getUser(userId);
  }

  public async banUser(userId: string): Promise<User> {
    return await this.client.users.banUser(userId);
  }

  public async unbanUser(userId: string): Promise<User> {
    return await this.client.users.unbanUser(userId);
  }

  public async getUser(userId: string): Promise<User> {
    return await this.client.users.getUser(userId);
  }

  public async lockUser(userId: string): Promise<User> {
    return await this.client.users.lockUser(userId);
  }

  public async unlockUser(userId: string): Promise<User> {
    return await this.client.users.unlockUser(userId);
  }

  public async updateUser(userId: string, params: Parameters<typeof this.client.users.updateUser>[1]): Promise<User> {
    return await this.client.users.updateUser(userId, params);
  }

  public async updateUserProfileImage(userId: string, params: { file: Blob | File }): Promise<User> {
    return await this.client.users.updateUserProfileImage(userId, params);
  }

  public async updateUserMetadata(
    userId: string,
    params: Parameters<typeof this.client.users.updateUserMetadata>[1],
  ): Promise<User> {
    return await this.client.users.updateUserMetadata(userId, params);
  }

  public async getUserMetadata(userId: string): Promise<{
    publicMetadata: User["publicMetadata"];
    privateMetadata: User["privateMetadata"];
    unsafeMetadata: User["unsafeMetadata"];
  }> {
    const user = await this.getUser(userId);
    return {
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      unsafeMetadata: user.unsafeMetadata,
    };
  }

  public async deleteUser(userId: string): Promise<User> {
    return await this.client.users.deleteUser(userId);
  }

  public async deleteUserProfileImage(userId: string): Promise<User> {
    return await this.client.users.deleteUserProfileImage(userId);
  }

  public async getSession(sessionId: string): Promise<Session> {
    return await this.client.sessions.getSession(sessionId);
  }

  public async getCurrentUserSession(token: string): Promise<Session | null> {
    const { sid: sessionId } = await verifyToken(token, {
      secretKey: this.secretKey,
    });

    if (!sessionId) {
      return null;
    }

    return await this.getSession(sessionId);
  }

  public async signOut(sessionId: string): Promise<Session> {
    return await this.client.sessions.revokeSession(sessionId);
  }
}
