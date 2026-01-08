import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeCrudCommand } = await import("@/commands/MakeCrudCommand");

describe("MakeCrudCommand", () => {
  let command: InstanceType<typeof MakeCrudCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeCrudCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `crud-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:crud");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new resource");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "entities", ".gitkeep"), "");
      await Bun.write(join(testDir, "src", "repositories", ".gitkeep"), "");
      await Bun.write(join(testDir, "src", "controllers", ".gitkeep"), "");
      await Bun.write(join(testDir, "src", "types", "routes", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "entities", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "repositories", ".gitkeep"), "");
      await Bun.write(join(testDir, "tests", "controllers", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate entity file", async () => {
      await command.run({ name: "Product" });

      const filePath = join(testDir, "src", "entities", "ProductEntity.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate repository file", async () => {
      await command.run({ name: "Product" });

      const filePath = join(testDir, "src", "repositories", "ProductRepository.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should generate all CRUD controllers", async () => {
      await command.run({ name: "Product" });

      const controllers = [
        "ProductCreateController.ts",
        "ProductGetController.ts",
        "ProductUpdateController.ts",
        "ProductDeleteController.ts",
        "ProductFilterController.ts",
      ];

      for (const controller of controllers) {
        const filePath = join(testDir, "src", "controllers", controller);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    test("should generate all route type files", async () => {
      await command.run({ name: "Product" });

      const routeTypes = [
        "api.product.create.ts",
        "api.product.get.ts",
        "api.product.update.ts",
        "api.product.delete.ts",
        "api.product.filter.ts",
      ];

      for (const routeType of routeTypes) {
        const filePath = join(testDir, "src", "types", "routes", routeType);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    test("should generate test files for all components", async () => {
      await command.run({ name: "Product" });

      // Entity test
      expect(existsSync(join(testDir, "tests", "entities", "ProductEntity.spec.ts"))).toBe(true);

      // Repository test
      expect(existsSync(join(testDir, "tests", "repositories", "ProductRepository.spec.ts"))).toBe(true);

      // Controller tests
      const controllerTests = [
        "ProductCreateController.spec.ts",
        "ProductGetController.spec.ts",
        "ProductUpdateController.spec.ts",
        "ProductDeleteController.spec.ts",
        "ProductFilterController.spec.ts",
      ];

      for (const test of controllerTests) {
        const filePath = join(testDir, "tests", "controllers", test);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    test("should normalize name with toPascalCase", async () => {
      await command.run({ name: "user-profile" });

      const filePath = join(testDir, "src", "entities", "UserProfileEntity.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should remove Entity suffix if provided", async () => {
      await command.run({ name: "ProductEntity" });

      const filePath = join(testDir, "src", "entities", "ProductEntity.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("ProductEntityEntity");
    });

    test("should remove Repository suffix if provided", async () => {
      await command.run({ name: "ProductRepository" });

      const filePath = join(testDir, "src", "repositories", "ProductRepository.ts");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).not.toContain("ProductRepositoryRepository");
    });

    test("should use pluralized route paths", async () => {
      await command.run({ name: "Category" });

      const createControllerPath = join(testDir, "src", "controllers", "CategoryCreateController.ts");
      const content = await Bun.file(createControllerPath).text();
      expect(content).toContain("/categories");
    });

    test("should include correct HTTP methods for each controller", async () => {
      await command.run({ name: "Item" });

      const createContent = await Bun.file(join(testDir, "src", "controllers", "ItemCreateController.ts")).text();
      expect(createContent).toContain("post");

      const getContent = await Bun.file(join(testDir, "src", "controllers", "ItemGetController.ts")).text();
      expect(getContent).toContain("get");

      const updateContent = await Bun.file(join(testDir, "src", "controllers", "ItemUpdateController.ts")).text();
      expect(updateContent).toContain("put");

      const deleteContent = await Bun.file(join(testDir, "src", "controllers", "ItemDeleteController.ts")).text();
      expect(deleteContent).toContain("delete");

      const filterContent = await Bun.file(join(testDir, "src", "controllers", "ItemFilterController.ts")).text();
      expect(filterContent).toContain("get");
    });

    test("should include :id parameter for get, update, and delete routes", async () => {
      await command.run({ name: "Order" });

      const getContent = await Bun.file(join(testDir, "src", "controllers", "OrderGetController.ts")).text();
      expect(getContent).toContain(":id");

      const updateContent = await Bun.file(join(testDir, "src", "controllers", "OrderUpdateController.ts")).text();
      expect(updateContent).toContain(":id");

      const deleteContent = await Bun.file(join(testDir, "src", "controllers", "OrderDeleteController.ts")).text();
      expect(deleteContent).toContain(":id");
    });

    test("should not include :id parameter for create and filter routes", async () => {
      await command.run({ name: "Order" });

      const createContent = await Bun.file(join(testDir, "src", "controllers", "OrderCreateController.ts")).text();
      expect(createContent).not.toContain(":id");

      const filterContent = await Bun.file(join(testDir, "src", "controllers", "OrderFilterController.ts")).text();
      expect(filterContent).not.toContain(":id");
    });
  });
});
