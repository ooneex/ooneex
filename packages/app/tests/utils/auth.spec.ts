import { describe, expect, test } from "bun:test";
import type { ContextType } from "@ooneex/controller";
import { HttpStatus } from "@ooneex/http-status";
import { ERole } from "@ooneex/role";
import { checkAllowedUsers } from "@/utils/auth";
import { createMockContext } from "./helpers";

describe("checkAllowedUsers", () => {
  test("returns null when no user is present", () => {
    const context = createMockContext({ user: null });

    const result = checkAllowedUsers(context);

    expect(result).toBeNull();
  });

  test("returns Forbidden when user is not in allowed users list", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "staging",
        STAGING_ALLOWED_USERS: ["allowed@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "notallowed@test.com", roles: [] } as unknown as ContextType["user"],
    });

    const result = checkAllowedUsers(context);

    expect(result).not.toBeNull();
    expect(result?.status).toBe(HttpStatus.Code.Forbidden);
    expect(result?.message).toContain("notallowed@test.com");
    expect(result?.message).toContain("staging");
    expect(result?.key).toBe("USER_NOT_ALLOWED");
  });

  test("returns null when user is in allowed users list", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "staging",
        STAGING_ALLOWED_USERS: ["allowed@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "allowed@test.com", roles: [] } as unknown as ContextType["user"],
    });

    const result = checkAllowedUsers(context);

    expect(result).toBeNull();
  });

  test("returns null when allowed users list is empty", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "staging",
        STAGING_ALLOWED_USERS: [],
      } as unknown as ContextType["env"],
      user: { email: "anyone@test.com", roles: [] } as unknown as ContextType["user"],
    });

    const result = checkAllowedUsers(context);

    expect(result).toBeNull();
  });

  test("returns null when allowed users property is undefined", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
      } as unknown as ContextType["env"],
      user: { email: "anyone@test.com", roles: [] } as unknown as ContextType["user"],
    });

    const result = checkAllowedUsers(context);

    expect(result).toBeNull();
  });

  test("checks correct env-specific allowed users list", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "development",
        DEVELOPMENT_ALLOWED_USERS: ["dev@test.com"],
        STAGING_ALLOWED_USERS: ["staging@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "staging@test.com", roles: [] } as unknown as ContextType["user"],
    });

    const result = checkAllowedUsers(context);

    expect(result).not.toBeNull();
    expect(result?.status).toBe(HttpStatus.Code.Forbidden);
    expect(result?.key).toBe("USER_NOT_ALLOWED");
  });

  test("adds SYSTEM role when user is in SYSTEM_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SYSTEM_USERS: ["system@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "system@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).toContain(ERole.SYSTEM);
  });

  test("does not duplicate SYSTEM role if already present", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SYSTEM_USERS: ["system@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "system@test.com", roles: [ERole.SYSTEM] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles.filter((r) => r === ERole.SYSTEM)).toHaveLength(1);
  });

  test("does not add SYSTEM role when user is not in SYSTEM_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SYSTEM_USERS: ["other@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "user@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).not.toContain(ERole.SYSTEM);
  });

  test("adds SUPER_ADMIN role when user is in SUPER_ADMIN_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SUPER_ADMIN_USERS: ["superadmin@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "superadmin@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).toContain(ERole.SUPER_ADMIN);
  });

  test("does not duplicate SUPER_ADMIN role if already present", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SUPER_ADMIN_USERS: ["superadmin@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "superadmin@test.com", roles: [ERole.SUPER_ADMIN] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles.filter((r) => r === ERole.SUPER_ADMIN)).toHaveLength(1);
  });

  test("does not add SUPER_ADMIN role when user is not in SUPER_ADMIN_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SUPER_ADMIN_USERS: ["other@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "user@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).not.toContain(ERole.SUPER_ADMIN);
  });

  test("adds ADMIN role when user is in ADMIN_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        ADMIN_USERS: ["admin@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "admin@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).toContain(ERole.ADMIN);
  });

  test("does not duplicate ADMIN role if already present", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        ADMIN_USERS: ["admin@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "admin@test.com", roles: [ERole.ADMIN] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles.filter((r) => r === ERole.ADMIN)).toHaveLength(1);
  });

  test("does not add ADMIN role when user is not in ADMIN_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        ADMIN_USERS: ["other@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "user@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).not.toContain(ERole.ADMIN);
  });

  test("adds all roles when user is in SYSTEM_USERS, SUPER_ADMIN_USERS, and ADMIN_USERS", () => {
    const context = createMockContext({
      env: {
        APP_ENV: "production",
        SYSTEM_USERS: ["multi@test.com"],
        SUPER_ADMIN_USERS: ["multi@test.com"],
        ADMIN_USERS: ["multi@test.com"],
      } as unknown as ContextType["env"],
      user: { email: "multi@test.com", roles: [] } as unknown as ContextType["user"],
    });

    checkAllowedUsers(context);

    expect(context.user?.roles).toContain(ERole.SYSTEM);
    expect(context.user?.roles).toContain(ERole.SUPER_ADMIN);
    expect(context.user?.roles).toContain(ERole.ADMIN);
  });
});
