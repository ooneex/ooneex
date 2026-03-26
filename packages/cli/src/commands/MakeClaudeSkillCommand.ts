import { basename, join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { Glob } from "bun";
import { decorator } from "../decorators";
import type { ICommand } from "../types";

@decorator.command()
export class MakeClaudeSkillCommand implements ICommand {
  public getName(): string {
    return "make:claude:skill";
  }

  public getDescription(): string {
    return "Generate Claude skills from templates";
  }

  public async run(): Promise<void> {
    const templatesDir = join(import.meta.dir, "..", "templates", "claude", "skills");
    const skillsLocalDir = join(".claude", "skills");
    const skillsDir = join(process.cwd(), skillsLocalDir);

    const glob = new Glob("*.md.txt");
    const logger = new TerminalLogger();

    for await (const file of glob.scan(templatesDir)) {
      const content = await Bun.file(join(templatesDir, file)).text();
      const skillName = basename(file, ".md.txt");
      const filePath = join(skillsDir, `${skillName}.md`);
      await Bun.write(filePath, content);

      logger.success(`${join(skillsLocalDir, skillName)}.md created successfully`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
