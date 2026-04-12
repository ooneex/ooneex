import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeBenchmarkCommand } = await import("@/commands/MakeBenchmarkCommand");

describe("MakeBenchmarkCommand", () => {
  let command: InstanceType<typeof MakeBenchmarkCommand>;
  let testDir: string;
  let originalCwd: string;

  const controllerContent = `import type { ContextType } from "@ooneex/controller";
import { inject } from "@ooneex/container";
import { ERole } from "@ooneex/role";
import { Route } from "@ooneex/routing";
import { Assert } from "@ooneex/validation";
import { UpdateStatusService } from "../services/UpdateStatusService";

type UpdateStatusRouteType = {
  params: { id: string };
  payload: { name?: string; lang?: string; color?: string; description?: string };
  response: Record<string, never>;
};

@Route.patch("/statuses/:id", {
  name: "status.update",
  version: 1,
  description: "Update a status",
  params: {
    id: Assert("string"),
  },
  payload: Assert({
    name: "string?",
    lang: "string?",
    color: "string?",
    description: "string?",
  }),
  response: Assert({
    id: "string",
    name: "string",
    lang: "string",
    color: "string?",
    description: "string?",
  }),
  roles: [ERole.USER],
})
export class UpdateStatusController {
  constructor(
    @inject(UpdateStatusService) private readonly service: UpdateStatusService,
  ) {}

  public async index(context: ContextType<UpdateStatusRouteType>) {
    const { id } = context.params;
    const { name, lang, color, description } = context.payload;
    const status = await this.service.execute({ id, name, lang, color, description });
    return context.response.json(status || {});
  }
}
`;

  const listControllerContent = `import type { ContextType } from "@ooneex/controller";
import { inject } from "@ooneex/container";
import { ERole } from "@ooneex/role";
import { Route } from "@ooneex/routing";
import { Assert } from "@ooneex/validation";
import { ListStatusesService } from "../services/ListStatusesService";

type ListStatusesRouteType = {
  queries: { page?: number; limit?: number; q?: string };
  response: Record<string, never>;
};

@Route.get("/statuses", {
  name: "status.list",
  version: 1,
  description: "List all statuses",
  queries: Assert({
    page: "number?",
    limit: "number?",
    q: "string?",
  }),
  roles: [ERole.USER],
})
export class ListStatusesController {
  constructor(
    @inject(ListStatusesService) private readonly service: ListStatusesService,
  ) {}

  public async index(context: ContextType<ListStatusesRouteType>) {
    const { page, limit, q } = context.queries;
    const result = await this.service.execute({ page, limit, q });
    return context.response.json(result);
  }
}
`;

  beforeEach(() => {
    command = new MakeBenchmarkCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `benchmark-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:benchmark");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate a new benchmark file");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "controllers", ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test" }, null, 2));
      process.chdir(testDir);
    });

    test("should generate benchmark file from controller with params and payload", async () => {
      await Bun.write(join(testDir, "src", "controllers", "UpdateStatusController.ts"), controllerContent);

      await command.run({ name: "load", target: "UpdateStatusController" });

      const filePath = join(testDir, "src", "controllers", "load.bench.json");
      expect(existsSync(filePath)).toBe(true);

      const content = JSON.parse(await Bun.file(filePath).text());
      expect(content.name).toBe("status.update");
      expect(content.path).toBe("/statuses/:id");
      expect(content.method).toBe("PATCH");
      expect(content.description).toBe("Update a status");
      expect(content.params).toEqual({ id: "" });
      expect(content.payload).toEqual({ name: "", lang: "", color: "", description: "" });
      expect(content.connections).toBe(10);
      expect(content.duration).toBe(10);
    });

    test("should generate benchmark file from controller with queries", async () => {
      await Bun.write(join(testDir, "src", "controllers", "ListStatusesController.ts"), listControllerContent);

      await command.run({ name: "load", target: "ListStatusesController" });

      const filePath = join(testDir, "src", "controllers", "load.bench.json");
      expect(existsSync(filePath)).toBe(true);

      const content = JSON.parse(await Bun.file(filePath).text());
      expect(content.name).toBe("status.list");
      expect(content.path).toBe("/statuses");
      expect(content.method).toBe("GET");
      expect(content.description).toBe("List all statuses");
      expect(content.queries).toEqual({ page: 0, limit: 0, q: "" });
      expect(content).not.toHaveProperty("params");
      expect(content).not.toHaveProperty("payload");
    });

    test("should handle target without Controller suffix", async () => {
      await Bun.write(join(testDir, "src", "controllers", "UpdateStatusController.ts"), controllerContent);

      await command.run({ name: "stress", target: "UpdateStatus" });

      const filePath = join(testDir, "src", "controllers", "stress.bench.json");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should error when controller does not exist", async () => {
      await command.run({ name: "load", target: "NonExistentController" });

      const files = new Bun.Glob("*.bench.json").scanSync(join(testDir, "src", "controllers"));
      expect([...files]).toHaveLength(0);
    });

    test("should generate benchmark file in module controllers folder", async () => {
      const moduleControllersDir = join(testDir, "modules", "status", "src", "controllers");
      await Bun.write(join(moduleControllersDir, "UpdateStatusController.ts"), controllerContent);
      await Bun.write(join(testDir, "modules", "status", "package.json"), JSON.stringify({ name: "status" }, null, 2));

      await command.run({ name: "load", module: "status", target: "UpdateStatusController" });

      const filePath = join(moduleControllersDir, "load.bench.json");
      expect(existsSync(filePath)).toBe(true);
    });

    test("should set default connections and duration to 10", async () => {
      await Bun.write(join(testDir, "src", "controllers", "ListStatusesController.ts"), listControllerContent);

      await command.run({ name: "perf", target: "ListStatusesController" });

      const filePath = join(testDir, "src", "controllers", "perf.bench.json");
      const content = JSON.parse(await Bun.file(filePath).text());
      expect(content.connections).toBe(10);
      expect(content.duration).toBe(10);
    });

    test("should use number default for number type fields", async () => {
      await Bun.write(join(testDir, "src", "controllers", "ListStatusesController.ts"), listControllerContent);

      await command.run({ name: "load", target: "ListStatusesController" });

      const filePath = join(testDir, "src", "controllers", "load.bench.json");
      const content = JSON.parse(await Bun.file(filePath).text());
      expect(content.queries.page).toBe(0);
      expect(content.queries.limit).toBe(0);
      expect(content.queries.q).toBe("");
    });
  });
});
