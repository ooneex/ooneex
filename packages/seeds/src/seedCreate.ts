import { join } from "node:path";
import { parseArgs } from "node:util";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { Glob } from "bun";
import content from "./seed.txt";

export const seedCreate = async (config: { dir?: string }): Promise<void> => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: { name: { type: "string" } },
    strict: true,
    allowPositionals: true,
  });

  const logger = new TerminalLogger();

  if (!values.name) {
    logger.error("Name is required\n");
    process.exit(1);
  }

  const name = `${toPascalCase(values.name)}Seed`;
  const seedsDir = config?.dir || "seeds";

  await Bun.write(join(seedsDir, `${name}.ts`), content.replaceAll("{{ name }}", name));

  const imports: string[] = [];
  const glob = new Glob("**/*Seed.ts");
  for await (const file of glob.scan(seedsDir)) {
    const name = file.replace(/\.ts$/, "");
    imports.push(`export { ${name} } from './${name}';`);
  }

  await Bun.write(join(seedsDir, "index.ts"), `${imports.sort().join("\n")}\n`);

  logger.success(`Seed ${name} created successfully\n`);
};
