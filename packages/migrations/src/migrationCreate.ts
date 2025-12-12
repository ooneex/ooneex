import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { Glob } from "bun";
import { generateMigrationVersion } from "./generateMigrationVersion";
import content from "./migration.txt";

export const migrationCreate = async (config?: { dir?: string }): Promise<void> => {
  const version = generateMigrationVersion();
  const name = `Migration${version}`;
  const migrationsDir = config?.dir || "migrations";
  const logger = new TerminalLogger();

  await Bun.write(
    join(process.cwd(), migrationsDir, `${name}.ts`),
    content.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version),
  );

  const imports: string[] = [];
  const glob = new Glob("**/Migration*.ts");
  for await (const file of glob.scan(migrationsDir)) {
    const name = file.replace(/\.ts$/, "");
    imports.push(`export { ${name} } from './${name}';`);
  }

  await Bun.write(join(process.cwd(), migrationsDir, "migrations.ts"), `${imports.sort().join("\n")}\n`);

  logger.success(`Migration ${name} created successfully\n`);
};
