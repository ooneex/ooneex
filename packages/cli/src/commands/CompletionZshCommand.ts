import { homedir } from "node:os";
import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import ooTemplate from "../templates/completions/_oo.txt";
import ooneexTemplate from "../templates/completions/_ooneex.txt";

@decorator.command()
export class CompletionZshCommand implements ICommand {
  public getName(): string {
    return "completion:zsh";
  }

  public getDescription(): string {
    return "Install Zsh completion for oo command";
  }

  public async run(): Promise<void> {
    const completionDir = join(homedir(), ".zsh");

    const ooFilePath = join(completionDir, "_oo");
    await Bun.write(ooFilePath, ooTemplate);

    const ooneexFilePath = join(completionDir, "_ooneex");
    await Bun.write(ooneexFilePath, ooneexTemplate);

    const logger = new TerminalLogger();

    logger.success(`${ooFilePath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${ooneexFilePath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.info(
      "Add the following to your .zshrc if not already present:\n  fpath=(~/.zsh $fpath)\n  autoload -Uz compinit && compinit",
      undefined,
      {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      },
    );
  }
}
