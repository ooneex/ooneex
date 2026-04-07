import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { Glob } from "bun";
import testTemplate from "./seed.test.txt";
import template from "./seed.txt";

export const seedCreate = async (config: {
  name: string;
  seedsDir?: string;
  testsDir?: string;
}): Promise<{ seedPath: string; testPath: string }> => {
  const name = toPascalCase(config.name).replace(/Seed$/, "");
  const seedName = `${name}Seed`;
  const seedsDir = config.seedsDir || "seeds";
  const testsDir = config.testsDir || join("tests", "seeds");

  await Bun.write(join(process.cwd(), seedsDir, `${seedName}.ts`), template.replaceAll("{{ name }}", seedName));

  const testContent = testTemplate.replace(/\{\{NAME\}\}/g, name);
  await Bun.write(join(process.cwd(), testsDir, `${seedName}.spec.ts`), testContent);

  const imports: string[] = [];
  const glob = new Glob("**/*Seed.ts");
  for await (const file of glob.scan(join(process.cwd(), seedsDir))) {
    const seedClassName = file.replace(/\.ts$/, "");
    imports.push(`export { ${seedClassName} } from './${seedClassName}';`);
  }

  await Bun.write(join(process.cwd(), seedsDir, "seeds.ts"), `${imports.sort().join("\n")}\n`);

  return {
    seedPath: join(seedsDir, `${seedName}.ts`),
    testPath: join(testsDir, `${seedName}.spec.ts`),
  };
};
