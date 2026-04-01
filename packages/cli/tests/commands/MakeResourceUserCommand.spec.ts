import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import banUserControllerTemplate from "@/templates/resources/user/controllers/BanUserController.txt";
import deleteUserProfileImageControllerTemplate from "@/templates/resources/user/controllers/DeleteUserProfileImageController.txt";
import lockUserControllerTemplate from "@/templates/resources/user/controllers/LockUserController.txt";
import signOutControllerTemplate from "@/templates/resources/user/controllers/SignOutController.txt";
import updateUserProfileControllerTemplate from "@/templates/resources/user/controllers/UpdateUserProfileController.txt";
import updateUserProfileImageControllerTemplate from "@/templates/resources/user/controllers/UpdateUserProfileImageController.txt";
import updateUserRolesControllerTemplate from "@/templates/resources/user/controllers/UpdateUserRolesController.txt";
import banUserServiceTemplate from "@/templates/resources/user/services/BanUserService.txt";
import deleteUserProfileImageServiceTemplate from "@/templates/resources/user/services/DeleteUserProfileImageService.txt";
import lockUserServiceTemplate from "@/templates/resources/user/services/LockUserService.txt";
import signOutServiceTemplate from "@/templates/resources/user/services/SignOutService.txt";
import updateUserProfileImageServiceTemplate from "@/templates/resources/user/services/UpdateUserProfileImageService.txt";
import updateUserProfileServiceTemplate from "@/templates/resources/user/services/UpdateUserProfileService.txt";
import updateUserRolesServiceTemplate from "@/templates/resources/user/services/UpdateUserRolesService.txt";
import entityTemplate from "@/templates/resources/user/UserEntity.txt";
import repositoryTemplate from "@/templates/resources/user/UserRepository.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceUserCommand } = await import("@/commands/MakeResourceUserCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceUserCommand", () => {
  let command: InstanceType<typeof MakeResourceUserCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceUserCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-user-${Date.now()}`);

    // Mock Bun.spawn to avoid running bun add in tests
    originalSpawn = Bun.spawn;
    Bun.spawn = ((...args: unknown[]) => {
      const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
      if (Array.isArray(cmd) && cmd[0] === "bun" && cmd[1] === "add") {
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }
      return originalSpawn.apply(Bun, args as Parameters<typeof Bun.spawn>);
    }) as typeof Bun.spawn;
  });

  afterEach(() => {
    Bun.spawn = originalSpawn;
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:resource:user");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate user resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create user module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "user");
      expect(await exists(join(moduleDir, "src", "UserModule.ts"))).toBe(true);
    });

    test("should generate entity file with user template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "user", "src", "entities", "UserEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with user template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "user", "src", "repositories", "UserRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with user template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "user", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS users");
        expect(content).toContain("idx_users_email");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all seven controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "user", "src", "controllers");
        expect(await exists(join(controllersDir, "BanUserController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "LockUserController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "SignOutController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateUserProfileController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateUserProfileImageController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteUserProfileImageController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateUserRolesController.ts"))).toBe(true);
      });

      test("should replace controller contents with user templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "user", "src", "controllers");

        const banContent = await Bun.file(join(controllersDir, "BanUserController.ts")).text();
        expect(banContent).toBe(banUserControllerTemplate);

        const lockContent = await Bun.file(join(controllersDir, "LockUserController.ts")).text();
        expect(lockContent).toBe(lockUserControllerTemplate);

        const signOutContent = await Bun.file(join(controllersDir, "SignOutController.ts")).text();
        expect(signOutContent).toBe(signOutControllerTemplate);

        const profileContent = await Bun.file(join(controllersDir, "UpdateUserProfileController.ts")).text();
        expect(profileContent).toBe(updateUserProfileControllerTemplate);

        const profileImageContent = await Bun.file(
          join(controllersDir, "UpdateUserProfileImageController.ts"),
        ).text();
        expect(profileImageContent).toBe(updateUserProfileImageControllerTemplate);

        const deleteImageContent = await Bun.file(
          join(controllersDir, "DeleteUserProfileImageController.ts"),
        ).text();
        expect(deleteImageContent).toBe(deleteUserProfileImageControllerTemplate);

        const rolesContent = await Bun.file(join(controllersDir, "UpdateUserRolesController.ts")).text();
        expect(rolesContent).toBe(updateUserRolesControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all seven service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "user", "src", "services");
        expect(await exists(join(servicesDir, "BanUserService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "LockUserService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "SignOutService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateUserProfileService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateUserProfileImageService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteUserProfileImageService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateUserRolesService.ts"))).toBe(true);
      });

      test("should replace service contents with user templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "user", "src", "services");

        const banContent = await Bun.file(join(servicesDir, "BanUserService.ts")).text();
        expect(banContent).toBe(banUserServiceTemplate);

        const lockContent = await Bun.file(join(servicesDir, "LockUserService.ts")).text();
        expect(lockContent).toBe(lockUserServiceTemplate);

        const signOutContent = await Bun.file(join(servicesDir, "SignOutService.ts")).text();
        expect(signOutContent).toBe(signOutServiceTemplate);

        const profileContent = await Bun.file(join(servicesDir, "UpdateUserProfileService.ts")).text();
        expect(profileContent).toBe(updateUserProfileServiceTemplate);

        const profileImageContent = await Bun.file(join(servicesDir, "UpdateUserProfileImageService.ts")).text();
        expect(profileImageContent).toBe(updateUserProfileImageServiceTemplate);

        const deleteImageContent = await Bun.file(join(servicesDir, "DeleteUserProfileImageService.ts")).text();
        expect(deleteImageContent).toBe(deleteUserProfileImageServiceTemplate);

        const rolesContent = await Bun.file(join(servicesDir, "UpdateUserRolesService.ts")).text();
        expect(rolesContent).toBe(updateUserRolesServiceTemplate);
      });
    });

    test("should generate entity content with UserEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "user", "src", "entities", "UserEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class UserEntity");
      expect(content).toContain('name: "users"');
    });

    test("should generate repository content with UserRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "user", "src", "repositories", "UserRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class UserRepository");
      expect(content).toContain("UserEntity");
    });
  });
});
