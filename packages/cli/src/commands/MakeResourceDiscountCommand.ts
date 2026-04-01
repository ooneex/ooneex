import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import createDiscountControllerTemplate from "../templates/resources/discount/controllers/CreateDiscountController.txt";
import deleteDiscountControllerTemplate from "../templates/resources/discount/controllers/DeleteDiscountController.txt";
import getDiscountControllerTemplate from "../templates/resources/discount/controllers/GetDiscountController.txt";
import listDiscountsControllerTemplate from "../templates/resources/discount/controllers/ListDiscountsController.txt";
import updateDiscountControllerTemplate from "../templates/resources/discount/controllers/UpdateDiscountController.txt";
import entityTemplate from "../templates/resources/discount/DiscountEntity.txt";
import migrationTemplate from "../templates/resources/discount/DiscountMigration.txt";
import repositoryTemplate from "../templates/resources/discount/DiscountRepository.txt";
import createDiscountServiceTemplate from "../templates/resources/discount/services/CreateDiscountService.txt";
import deleteDiscountServiceTemplate from "../templates/resources/discount/services/DeleteDiscountService.txt";
import getDiscountServiceTemplate from "../templates/resources/discount/services/GetDiscountService.txt";
import listDiscountsServiceTemplate from "../templates/resources/discount/services/ListDiscountsService.txt";
import updateDiscountServiceTemplate from "../templates/resources/discount/services/UpdateDiscountService.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceDiscountCommand implements ICommand {
  public getName(): string {
    return "make:resource:discount";
  }

  public getDescription(): string {
    return "Generate discount resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "discount";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Discount", module, tableName: "discounts" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Discount", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateDiscount",
        route: { name: "discount.create", path: "/discounts" as const, method: "POST" as const },
      },
      {
        name: "GetDiscount",
        route: { name: "discount.get", path: "/discounts/:id" as const, method: "GET" as const },
      },
      {
        name: "ListDiscounts",
        route: { name: "discount.list", path: "/discounts" as const, method: "GET" as const },
      },
      {
        name: "UpdateDiscount",
        route: { name: "discount.update", path: "/discounts/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteDiscount",
        route: { name: "discount.delete", path: "/discounts/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with discount templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateDiscountController.ts"), createDiscountControllerTemplate);
    await Bun.write(join(controllersDir, "GetDiscountController.ts"), getDiscountControllerTemplate);
    await Bun.write(join(controllersDir, "ListDiscountsController.ts"), listDiscountsControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateDiscountController.ts"), updateDiscountControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteDiscountController.ts"), deleteDiscountControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateDiscount", "GetDiscount", "ListDiscounts", "UpdateDiscount", "DeleteDiscount"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with discount templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateDiscountService.ts"), createDiscountServiceTemplate);
    await Bun.write(join(servicesDir, "GetDiscountService.ts"), getDiscountServiceTemplate);
    await Bun.write(join(servicesDir, "ListDiscountsService.ts"), listDiscountsServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateDiscountService.ts"), updateDiscountServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteDiscountService.ts"), deleteDiscountServiceTemplate);

    // Replace entity content with discount template
    const entityPath = join(process.cwd(), base, "src", "entities", "DiscountEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with discount template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with discount template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "DiscountRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
