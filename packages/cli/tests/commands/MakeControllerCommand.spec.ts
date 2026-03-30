import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import moduleTemplate from "@/templates/module/module.txt";

// Mock enquirer before importing commands - return proper values for prompts
const promptMock = mock(() =>
  Promise.resolve({
    name: "test",
    routeName: "api.test.index",
    method: "GET",
    path: "/test",
    confirm: false,
  }),
);

mock.module("enquirer", () => ({
  prompt: promptMock,
}));

const { MakeControllerCommand } = await import("@/commands/MakeControllerCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeControllerCommand", () => {
  let command: InstanceType<typeof MakeControllerCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeControllerCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `controller-${Date.now()}`);

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
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("UserController");
    });

    test("should generate test file for controller", async () => {
      await command.run({
        name: "User",
        isSocket: false,
      });

      const testFilePath = join(testDir, "tests", "controllers", "UserController.spec.ts");
      expect(await exists(testFilePath)).toBe(true);

      const content = await Bun.file(testFilePath).text();
      expect(content).toContain("UserController");
    });

    test("should generate route type file", async () => {
      await command.run({
        name: "User",
        isSocket: false,
      });

      // Route type file is named after the routeName from the prompt
      const routeTypeFilePath = join(testDir, "src", "types", "routes", "api.test.index.ts");
      expect(await exists(routeTypeFilePath)).toBe(true);

      const content = await Bun.file(routeTypeFilePath).text();
      expect(content).toContain("ApiTestIndex");
      expect(content).not.toContain("{{TYPE_NAME}}");
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({
        name: "user-profile",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "UserProfileController.ts");
      expect(await exists(filePath)).toBe(true);
    });

    test("should remove Controller suffix if provided", async () => {
      await command.run({
        name: "UserController",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "UserController.ts");
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("UserControllerController");
    });

    test("should replace all placeholders in template", async () => {
      await command.run({
        name: "Product",
        isSocket: false,
      });

      const filePath = join(testDir, "src", "controllers", "ProductController.ts");
      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("{{NAME}}");
      expect(content).not.toContain("{{ROUTE_NAME}}");
      expect(content).not.toContain("{{ROUTE_PATH}}");
      expect(content).not.toContain("{{ROUTE_METHOD}}");
      expect(content).not.toContain("{{TYPE_NAME}}");
      expect(content).not.toContain("{{TYPE_NAME_FILE}}");
      expect(content).toContain("ProductController");
      expect(content).toContain("api.test.index");
      expect(content).toContain("/test");
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
      expect(await exists(filePath)).toBe(true);
    });

    test("should generate test file for socket controller", async () => {
      await command.run({
        name: "Notification",
        isSocket: true,
      });

      const testFilePath = join(testDir, "tests", "controllers", "NotificationController.spec.ts");
      expect(await exists(testFilePath)).toBe(true);
    });

    test("should use socket template for socket controller", async () => {
      await command.run({
        name: "Realtime",
        isSocket: true,
      });

      const filePath = join(testDir, "src", "controllers", "RealtimeController.ts");
      expect(await exists(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("RealtimeController");
    });
  });

  describe("Module integration", () => {
    beforeEach(async () => {
      // Use a properly named directory so basename works for module detection
      testDir = join(originalCwd, ".temp", "blog");
      const moduleContent = moduleTemplate.replace(/{{NAME}}/g, "Blog");
      await Bun.write(join(testDir, "src", "BlogModule.ts"), moduleContent);
      await Bun.write(join(testDir, "src", "controllers", ".gitkeep"), "");
      await Bun.write(join(testDir, "src", "types", "routes", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "controllers", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should add import and class to module controllers array", async () => {
      await command.run({ name: "CreatePost", isSocket: false });

      const content = await Bun.file(join(testDir, "src", "BlogModule.ts")).text();
      expect(content).toContain('import { CreatePostController } from "./controllers/CreatePostController"');
      expect(content).toContain("CreatePostController");
      // Should be in the controllers array
      expect(content).toMatch(/controllers:\s*\[.*CreatePostController.*\]/s);
    });

    test("should accumulate multiple controllers in module", async () => {
      await command.run({ name: "CreatePost", isSocket: false });
      await command.run({ name: "ListPost", isSocket: false });

      const content = await Bun.file(join(testDir, "src", "BlogModule.ts")).text();
      expect(content).toContain('import { CreatePostController } from "./controllers/CreatePostController"');
      expect(content).toContain('import { ListPostController } from "./controllers/ListPostController"');
      expect(content).toMatch(/controllers:\s*\[.*CreatePostController.*ListPostController.*\]/s);
    });
  });
});
