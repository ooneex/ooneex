import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createVideoControllerTemplate from "@/templates/resources/video/controllers/CreateVideoController.txt";
import deleteVideoControllerTemplate from "@/templates/resources/video/controllers/DeleteVideoController.txt";
import getVideoControllerTemplate from "@/templates/resources/video/controllers/GetVideoController.txt";
import listVideosControllerTemplate from "@/templates/resources/video/controllers/ListVideosController.txt";
import updateVideoControllerTemplate from "@/templates/resources/video/controllers/UpdateVideoController.txt";
import createVideoServiceTemplate from "@/templates/resources/video/services/CreateVideoService.txt";
import deleteVideoServiceTemplate from "@/templates/resources/video/services/DeleteVideoService.txt";
import getVideoServiceTemplate from "@/templates/resources/video/services/GetVideoService.txt";
import listVideosServiceTemplate from "@/templates/resources/video/services/ListVideosService.txt";
import updateVideoServiceTemplate from "@/templates/resources/video/services/UpdateVideoService.txt";
import entityTemplate from "@/templates/resources/video/VideoEntity.txt";
import repositoryTemplate from "@/templates/resources/video/VideoRepository.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceVideoCommand } = await import("@/commands/MakeResourceVideoCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceVideoCommand", () => {
  let command: InstanceType<typeof MakeResourceVideoCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceVideoCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-video-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:video");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate video resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create video module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "video");
      expect(await exists(join(moduleDir, "src", "VideoModule.ts"))).toBe(true);
    });

    test("should generate entity file with video template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "video", "src", "entities", "VideoEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with video template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "video", "src", "repositories", "VideoRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with video template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "video", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS videos");
        expect(content).toContain("idx_videos_title");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "video", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateVideoController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetVideoController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListVideosController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateVideoController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteVideoController.ts"))).toBe(true);
      });

      test("should replace controller contents with video templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "video", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateVideoController.ts")).text();
        expect(createContent).toBe(createVideoControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetVideoController.ts")).text();
        expect(getContent).toBe(getVideoControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListVideosController.ts")).text();
        expect(listContent).toBe(listVideosControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateVideoController.ts")).text();
        expect(updateContent).toBe(updateVideoControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteVideoController.ts")).text();
        expect(deleteContent).toBe(deleteVideoControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "video", "src", "services");
        expect(await exists(join(servicesDir, "CreateVideoService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetVideoService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListVideosService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateVideoService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteVideoService.ts"))).toBe(true);
      });

      test("should replace service contents with video templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "video", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateVideoService.ts")).text();
        expect(createContent).toBe(createVideoServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetVideoService.ts")).text();
        expect(getContent).toBe(getVideoServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListVideosService.ts")).text();
        expect(listContent).toBe(listVideosServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateVideoService.ts")).text();
        expect(updateContent).toBe(updateVideoServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteVideoService.ts")).text();
        expect(deleteContent).toBe(deleteVideoServiceTemplate);
      });
    });

    test("should generate entity content with VideoEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "video", "src", "entities", "VideoEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class VideoEntity");
      expect(content).toContain('name: "videos"');
    });

    test("should generate repository content with VideoRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "video", "src", "repositories", "VideoRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class VideoRepository");
      expect(content).toContain("VideoEntity");
    });
  });
});
