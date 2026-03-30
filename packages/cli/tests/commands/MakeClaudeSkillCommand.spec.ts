import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";

const { MakeClaudeSkillCommand } = await import("@/commands/MakeClaudeSkillCommand");

describe("MakeClaudeSkillCommand", () => {
  let command: InstanceType<typeof MakeClaudeSkillCommand>;
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    command = new MakeClaudeSkillCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `claude-skill-${Date.now()}`);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:claude:skill");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate Claude skills from templates");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".claude", "skills", ".gitkeep"), "");
      process.chdir(testDir);
    });

    test("should generate skill files from templates", async () => {
      await command.run();

      const skillsDir = join(testDir, ".claude", "skills");
      const glob = new Glob("*/SKILL.md");
      const files: string[] = [];

      for await (const file of glob.scan(skillsDir)) {
        files.push(file);
      }

      expect(files.length).toBeGreaterThan(0);
    });

    test("should generate SKILL.md files inside skill directories", async () => {
      await command.run();

      const skillsDir = join(testDir, ".claude", "skills");
      const glob = new Glob("*/SKILL.md");

      for await (const file of glob.scan(skillsDir)) {
        expect(file.endsWith("SKILL.md")).toBe(true);
      }
    });

    test("should generate make-ai skill", async () => {
      await command.run();

      const filePath = join(testDir, ".claude", "skills", "make-ai", "SKILL.md");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("name: make:ai");
    });

    test("should generate make-controller skill", async () => {
      await command.run();

      const filePath = join(testDir, ".claude", "skills", "make-controller", "SKILL.md");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("name: make:controller");
    });

    test("should generate make-service skill", async () => {
      await command.run();

      const filePath = join(testDir, ".claude", "skills", "make-service", "SKILL.md");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("name: make:service");
    });

    test("should generate commit skill", async () => {
      await command.run();

      const filePath = join(testDir, ".claude", "skills", "commit", "SKILL.md");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("name: commit");
    });

    test("should generate optimize skill", async () => {
      await command.run();

      const filePath = join(testDir, ".claude", "skills", "optimize", "SKILL.md");
      expect(existsSync(filePath)).toBe(true);

      const content = await Bun.file(filePath).text();
      expect(content).toContain("name: optimize");
    });

    test("should preserve frontmatter in generated files", async () => {
      await command.run();

      const skillsDir = join(testDir, ".claude", "skills");
      const glob = new Glob("*/SKILL.md");

      for await (const file of glob.scan(skillsDir)) {
        const content = await Bun.file(join(skillsDir, file)).text();
        expect(content).toStartWith("---\n");
        expect(content).toContain("name:");
        expect(content).toContain("description:");
      }
    });

    test("should generate all 18 skill templates", async () => {
      await command.run();

      const skillsDir = join(testDir, ".claude", "skills");
      const glob = new Glob("*/SKILL.md");
      const files: string[] = [];

      for await (const file of glob.scan(skillsDir)) {
        files.push(file);
      }

      expect(files.length).toBe(20);
    });
  });
});
