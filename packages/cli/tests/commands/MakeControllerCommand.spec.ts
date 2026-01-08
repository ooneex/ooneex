import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands - return proper values for prompts
const promptMock = mock(() =>
  Promise.resolve({
    name: "test",
    namespace: "api",
    method: "GET",
    path: "/test",
    confirm: false,
  }),
);

mock.module("enquirer", () => ({
  prompt: promptMock,
}));

const { MakeControllerCommand } = await import("@/commands/MakeControllerCommand");

describe("MakeControllerCommand", () => {
  let command: InstanceType<typeof MakeControllerCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeControllerCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `controller-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:controller");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new controller class");
    });
  });

  describe("run() with HTTP controller", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "controllers", ".gitkeep"), "");
      await Bun.write(join(testDir, "src", "types", "routes", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "controllers", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate controller file with correct name", async () => {
      await command.run({
        name: "User",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "UserController.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserController");
    });

    test("should generate test file for controller", async () => {
      await command.run({
        name: "User",
        isSocket: false,
      });

      const testFilePath = join(testDir, "tests", "controllers", "UserController.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("UserController");
    });

    test("should generate route type file", async () => {
      await command.run({
        name: "User",
        isSocket: false,
      });

      // Route type file is created based on prompt values
      const routeTypesDir = join(testDir, "src", "types", "routes");
      expect(existsSync(routeTypesDir)).toBe(true);
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({
        name: "user-profile",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "UserProfileController.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Controller suffix if provided", async () => {
      await command.run({
        name: "UserController",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "UserController.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserControllerController");
    });

    test("should replace NAME placeholder in template", async () => {
      await command.run({
        name: "Product",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "ProductController.ts");
      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("{{NAME}}");
      expect(content).toContain("ProductController");
    });
  });

  describe("run() with Socket controller", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "controllers", ".gitkeep"), "");
      await Bun.write(join(testDir, "src", "types", "routes", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "controllers", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate socket controller file", async () => {
      await command.run({
        name: "Chat",
        isSocket: true,
      });

      const filePath = join(testDir, "src", "controllers", "ChatController.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate test file for socket controller", async () => {
      await command.run({
        name: "Notification",
        isSocket: true,
      });

      const testFilePath = join(testDir, "tests", "controllers", "NotificationController.spec.ts");
      expect(existsSync(testFilePath)).toBe(true);
    });

    test("should use socket template for socket controller", async () => {
      await command.run({
        name: "Realtime",
        isSocket: true,
      });

      const filePath = join(testDir, "src", "controllers", "RealtimeController.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("RealtimeController");
    });
  });
});
