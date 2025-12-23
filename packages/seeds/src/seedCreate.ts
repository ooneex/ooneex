import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { Glob } from "bun";
import content from "./seed.txt";

export const seedCreate = async (config: { name: string; dir?: string }): Promise<string> => {
  const name = `${toPascalCase(config.name)}Seed`;
  const seedsDir = config.dir || "seeds";

  await Bun.write(join(process.cwd(), seedsDir, `${name}.ts`), content.replaceAll("{{ name }}", name));

  const imports: string[] = [];
  const glob = new Glob("**/*Seed.ts");
  for await (const file of glob.scan(seedsDir)) {
    const name = file.replace(/\.ts$/, "");
    imports.push(`export { ${name} } from './${name}';`);
  }

  await Bun.write(join(process.cwd(), seedsDir, "seeds.ts"), `${imports.sort().join("\n")}\n`);

  return join(seedsDir, `${name}.ts`);
};
