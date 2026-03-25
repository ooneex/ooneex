import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ERole } from "@ooneex/role";
import { AuthException } from "@/AuthException";
import { ClerkAuthMiddleware } from "@/ClerkAuthMiddleware";

mock.module("@ooneex/container", () => ({
  inject: () => () => {},
}));

const createMockClerkUser = (overrides: Record<string, unknown> = {}) => ({
  id: "clerk_user_123",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  primaryEmailAddressId: "email_1",
  emailAddresses: [{ id: "email_1", emailAddress: "john@example.com" }],
  phoneNumbers: [{ phoneNumber: "+1234567890" }],
  imageUrl: "https://example.com/avatar.jpg",
  lastActiveAt: 1700000000000,
  lastSignInAt: 1699999000000,
  createdAt: 1690000000000,
  updatedAt: 1700000000000,
  privateMetadata: {
    externalId: "ext_123",
    roles: [ERole.ADMIN],
  },
  ...overrides,
});

const createMockContext = (token: string | null = "valid-token") => ({
  header: {
    getBearerToken: mock(() => token),
  },
  user: undefined as unknown,
});

describe("ClerkAuthMiddleware", () => {
  let mockClerkAuth: { getCurrentUser: ReturnType<typeof mock> };
  let middleware: ClerkAuthMiddleware;

  beforeEach(() => {
    mockClerkAuth = {
      getCurrentUser: mock(() => Promise.resolve(createMockClerkUser())),
    };
    middleware = new ClerkAuthMiddleware(mockClerkAuth as never);
  });

  describe("Token validation", () => {
    test("should throw AuthException when bearer token is missing", async () => {
      const context = createMockContext(null);

      try {
        await middleware.handler(context as never);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect((error as AuthException).message).toBe("Authentication required: Missing bearer token");
      }
    });

    test("should throw AuthException when bearer token is empty string", async () => {
      const context = createMockContext("");

      try {
        await middleware.handler(context as never);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect((error as AuthException).message).toBe("Authentication required: Missing bearer token");
      }
    });

    test("should pass token to clerkAuth.getCurrentUser", async () => {
      const context = createMockContext("my-token");

      await middleware.handler(context as never);

      expect(mockClerkAuth.getCurrentUser).toHaveBeenCalledWith("my-token");
    });
  });

  describe("Clerk user validation", () => {
    test("should throw AuthException when clerkAuth returns null", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() => Promise.resolve(null));
      const context = createMockContext();

      try {
        await middleware.handler(context as never);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect((error as AuthException).message).toBe("Authentication failed: Invalid or expired token");
      }
    });

    test("should throw AuthException when user has no primary email", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            primaryEmailAddressId: "email_999",
            emailAddresses: [{ id: "email_1", emailAddress: "john@example.com" }],
          }),
        ),
      );
      const context = createMockContext();

      try {
        await middleware.handler(context as never);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect((error as AuthException).message).toBe("User has no primary email");
      }
    });

    test("should throw AuthException when emailAddresses is empty", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            emailAddresses: [],
          }),
        ),
      );
      const context = createMockContext();

      try {
        await middleware.handler(context as never);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect((error as AuthException).message).toBe("User has no primary email");
      }
    });
  });

  describe("User mapping", () => {
    test("should return the context", async () => {
      const context = createMockContext();

      const result = await middleware.handler(context as never);

      expect(result).toBe(context as never);
    });

    test("should set user on context with required fields mapped correctly", async () => {
      const context = createMockContext();

      await middleware.handler(context as never);

      expect(context.user).toBeDefined();
      const user = context.user as Record<string, unknown>;
      expect(user.id).toBe("ext_123");
      expect(user.externalId).toBe("clerk_user_123");
      expect(user.email).toBe("john@example.com");
      expect(user.roles).toEqual([ERole.ADMIN]);
    });

    test("should default roles to [ERole.USER] when privateMetadata has no roles", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            privateMetadata: { externalId: "ext_123" },
          }),
        ),
      );
      const context = createMockContext();

      await middleware.handler(context as never);

      expect((context.user as Record<string, unknown>).roles).toEqual([ERole.USER]);
    });

    test("should default roles to [ERole.USER] when privateMetadata.roles is undefined", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            privateMetadata: { externalId: "ext_123", roles: undefined },
          }),
        ),
      );
      const context = createMockContext();

      await middleware.handler(context as never);

      expect((context.user as Record<string, unknown>).roles).toEqual([ERole.USER]);
    });

    test("should map optional string fields when present", async () => {
      const context = createMockContext();

      await middleware.handler(context as never);

      const user = context.user as Record<string, unknown>;
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.username).toBe("johndoe");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
    });

    test("should not set optional string fields when absent", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            firstName: null,
            lastName: null,
            username: null,
            imageUrl: null,
          }),
        ),
      );
      const context = createMockContext();

      await middleware.handler(context as never);

      const user = context.user as Record<string, unknown>;
      expect(user.firstName).toBeUndefined();
      expect(user.lastName).toBeUndefined();
      expect(user.username).toBeUndefined();
      expect(user.avatar).toBeUndefined();
    });

    test("should map phone number from first phone entry", async () => {
      const context = createMockContext();

      await middleware.handler(context as never);

      expect((context.user as Record<string, unknown>).phone).toBe("+1234567890");
    });

    test("should not set phone when phoneNumbers is empty", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            phoneNumbers: [],
          }),
        ),
      );
      const context = createMockContext();

      await middleware.handler(context as never);

      expect((context.user as Record<string, unknown>).phone).toBeUndefined();
    });

    test("should map date fields correctly", async () => {
      const context = createMockContext();

      await middleware.handler(context as never);

      const user = context.user as Record<string, unknown>;
      expect(user.lastActiveAt).toEqual(new Date(1700000000000));
      expect(user.lastLoginAt).toEqual(new Date(1699999000000));
      expect(user.createdAt).toEqual(new Date(1690000000000));
      expect(user.updatedAt).toEqual(new Date(1700000000000));
    });

    test("should not set date fields when absent", async () => {
      mockClerkAuth.getCurrentUser.mockImplementation(() =>
        Promise.resolve(
          createMockClerkUser({
            lastActiveAt: null,
            lastSignInAt: null,
            createdAt: null,
            updatedAt: null,
          }),
        ),
      );
      const context = createMockContext();

      await middleware.handler(context as never);

      const user = context.user as Record<string, unknown>;
      expect(user.lastActiveAt).toBeUndefined();
      expect(user.lastLoginAt).toBeUndefined();
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });
  });
});
