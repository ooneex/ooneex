import { join } from "node:path";
import { MakeModuleCommand } from "./commands/MakeModuleCommand";

export const ensureModule = async (module: string): Promise<void> => {
  const moduleDir = join(process.cwd(), "modules", module);
  const moduleDirExists = await Bun.file(join(moduleDir, "package.json")).exists();

  if (!moduleDirExists) {
    const makeModule = new MakeModuleCommand();
    await makeModule.run({ name: module, cwd: process.cwd(), silent: true });
  }
};
