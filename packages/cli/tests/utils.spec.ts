import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";

// Mock enquirer before importing
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { ensureModule } = await import("@/utils");
const { MakeModuleCommand } = await import("@/commands/MakeModuleCommand");

describe("ensureModule", () => {
  let testDir: string;
  let originalCwd: string;
  let runSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `utils-${Date.now()}`);
    runSpy = spyOn(MakeModuleCommand.prototype, "run").mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    runSpy.mockRestore();
    rmSync(testDir, { recursive: true, force: true });
  });

  test("should call MakeModuleCommand.run when module does not exist", async () => {
    await Bun.write(join(testDir, ".gitkeep"), "");
    process.chdir(testDir);

    await ensureModule("blog");

    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(runSpy).toHaveBeenCalledWith({
      name: "blog",
      cwd: testDir,
      silent: true,
    });
  });

  test("should not call MakeModuleCommand.run when module already exists", async () => {
    await Bun.write(join(testDir, "modules", "blog", "package.json"), "{}");
    process.chdir(testDir);

    await ensureModule("blog");

    expect(runSpy).not.toHaveBeenCalled();
  });

  test("should check the correct module path", async () => {
    await Bun.write(join(testDir, "modules", "auth", "package.json"), "{}");
    process.chdir(testDir);

    // "auth" exists, should not run
    await ensureModule("auth");
    expect(runSpy).not.toHaveBeenCalled();

    // "blog" does not exist, should run
    await ensureModule("blog");
    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(runSpy).toHaveBeenCalledWith({
      name: "blog",
      cwd: testDir,
      silent: true,
    });
  });
});
