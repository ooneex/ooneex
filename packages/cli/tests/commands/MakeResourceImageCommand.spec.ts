import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import entityTemplate from "@/templates/resources/image/ImageEntity.txt";
import repositoryTemplate from "@/templates/resources/image/ImageRepository.txt";
import createImageControllerTemplate from "@/templates/resources/image/controllers/CreateImageController.txt";
import deleteImageControllerTemplate from "@/templates/resources/image/controllers/DeleteImageController.txt";
import getImageControllerTemplate from "@/templates/resources/image/controllers/GetImageController.txt";
import listImagesControllerTemplate from "@/templates/resources/image/controllers/ListImagesController.txt";
import updateImageControllerTemplate from "@/templates/resources/image/controllers/UpdateImageController.txt";
import createImageServiceTemplate from "@/templates/resources/image/services/CreateImageService.txt";
import deleteImageServiceTemplate from "@/templates/resources/image/services/DeleteImageService.txt";
import getImageServiceTemplate from "@/templates/resources/image/services/GetImageService.txt";
import listImagesServiceTemplate from "@/templates/resources/image/services/ListImagesService.txt";
import updateImageServiceTemplate from "@/templates/resources/image/services/UpdateImageService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceImageCommand } = await import("@/commands/MakeResourceImageCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceImageCommand", () => {
  let command: InstanceType<typeof MakeResourceImageCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceImageCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-image-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:image");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate image resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create image module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "image");
      expect(await exists(join(moduleDir, "src", "ImageModule.ts"))).toBe(true);
    });

    test("should generate entity file with image template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "image", "src", "entities", "ImageEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with image template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "image", "src", "repositories", "ImageRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with image template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "image", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS images");
        expect(content).toContain("idx_images_title");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "image", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateImageController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetImageController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListImagesController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateImageController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteImageController.ts"))).toBe(true);
      });

      test("should replace controller contents with image templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "image", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateImageController.ts")).text();
        expect(createContent).toBe(createImageControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetImageController.ts")).text();
        expect(getContent).toBe(getImageControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListImagesController.ts")).text();
        expect(listContent).toBe(listImagesControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateImageController.ts")).text();
        expect(updateContent).toBe(updateImageControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteImageController.ts")).text();
        expect(deleteContent).toBe(deleteImageControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "image", "src", "services");
        expect(await exists(join(servicesDir, "CreateImageService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetImageService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListImagesService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateImageService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteImageService.ts"))).toBe(true);
      });

      test("should replace service contents with image templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "image", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateImageService.ts")).text();
        expect(createContent).toBe(createImageServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetImageService.ts")).text();
        expect(getContent).toBe(getImageServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListImagesService.ts")).text();
        expect(listContent).toBe(listImagesServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateImageService.ts")).text();
        expect(updateContent).toBe(updateImageServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteImageService.ts")).text();
        expect(deleteContent).toBe(deleteImageServiceTemplate);
      });
    });

    test("should generate entity content with ImageEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "image", "src", "entities", "ImageEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class ImageEntity");
      expect(content).toContain('name: "images"');
    });

    test("should generate repository content with ImageRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "image", "src", "repositories", "ImageRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class ImageRepository");
      expect(content).toContain("ImageEntity");
    });
  });
});
