import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { decorator } from "../decorators";
import makeAi from "../templates/claude/skills/make.ai.md.txt";
import makeAnalytics from "../templates/claude/skills/make.analytics.md.txt";
import makeCache from "../templates/claude/skills/make.cache.md.txt";
import makeController from "../templates/claude/skills/make.controller.md.txt";
import makeCron from "../templates/claude/skills/make.cron.md.txt";
import makeDatabase from "../templates/claude/skills/make.database.md.txt";
import makeEntity from "../templates/claude/skills/make.entity.md.txt";
import makeLogger from "../templates/claude/skills/make.logger.md.txt";
import makeMailer from "../templates/claude/skills/make.mailer.md.txt";
import makeMiddleware from "../templates/claude/skills/make.middleware.md.txt";
import makeMigration from "../templates/claude/skills/make.migration.md.txt";
import makePermission from "../templates/claude/skills/make.permission.md.txt";
import makePubsub from "../templates/claude/skills/make.pubsub.md.txt";
import makeRepository from "../templates/claude/skills/make.repository.md.txt";
import makeSeed from "../templates/claude/skills/make.seed.md.txt";
import makeService from "../templates/claude/skills/make.service.md.txt";
import makeStorage from "../templates/claude/skills/make.storage.md.txt";
import makeVectorDatabase from "../templates/claude/skills/make.vector-database.md.txt";
import type { ICommand } from "../types";

const skills: Record<string, string> = {
  "make.ai": makeAi,
  "make.analytics": makeAnalytics,
  "make.cache": makeCache,
  "make.controller": makeController,
  "make.cron": makeCron,
  "make.database": makeDatabase,
  "make.entity": makeEntity,
  "make.logger": makeLogger,
  "make.mailer": makeMailer,
  "make.middleware": makeMiddleware,
  "make.migration": makeMigration,
  "make.permission": makePermission,
  "make.pubsub": makePubsub,
  "make.repository": makeRepository,
  "make.seed": makeSeed,
  "make.service": makeService,
  "make.storage": makeStorage,
  "make.vector-database": makeVectorDatabase,
};

@decorator.command()
export class MakeClaudeSkillCommand implements ICommand {
  public getName(): string {
    return "make:claude:skill";
  }

  public getDescription(): string {
    return "Generate Claude skills from templates";
  }

  public async run(): Promise<void> {
    const skillsLocalDir = join(".claude", "skills");
    const skillsDir = join(process.cwd(), skillsLocalDir);
    const logger = new TerminalLogger();

    for (const [skillName, content] of Object.entries(skills)) {
      const dirName = skillName.replace(/\./g, "-");
      const filePath = join(skillsDir, dirName, "SKILL.md");
      await Bun.write(filePath, content);

      logger.success(`${join(skillsLocalDir, dirName, "SKILL.md")} created successfully`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
