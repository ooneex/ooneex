import { join } from "node:path";
import { Glob } from "bun";
import { generateMigrationVersion } from "./generateMigrationVersion";
import testTemplate from "./migration.test.txt";
import template from "./migration.txt";

export const migrationCreate = async (config?: {
  migrationsDir?: string;
  testsDir?: string;
}): Promise<{ migrationPath: string; testPath: string }> => {
  const version = generateMigrationVersion();
  const name = `Migration${version}`;
  const migrationsDir = config?.migrationsDir || "migrations";
  const testsDir = config?.testsDir || join("tests", "migrations");

  await Bun.write(
    join(process.cwd(), migrationsDir, `${name}.ts`),
    template.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version),
  );

  const testContent = testTemplate.replace(/\{\{NAME\}\}/g, name);
  await Bun.write(join(process.cwd(), testsDir, `${name}.spec.ts`), testContent);

  const imports: string[] = [];
  const glob = new Glob("**/Migration*.ts");
  for await (const file of glob.scan(join(process.cwd(), migrationsDir))) {
    const migrationClassName = file.replace(/\.ts$/, "");
    imports.push(`export { ${migrationClassName} } from './${migrationClassName}';`);
  }

  await Bun.write(join(process.cwd(), migrationsDir, "migrations.ts"), `${imports.sort().join("\n")}\n`);

  return {
    migrationPath: join(migrationsDir, `${name}.ts`),
    testPath: join(testsDir, `${name}.spec.ts`),
  };
};
