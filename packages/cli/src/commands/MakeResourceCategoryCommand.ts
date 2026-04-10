import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import entityTemplate from "../templates/resources/category/CategoryEntity.txt";
import migrationTemplate from "../templates/resources/category/CategoryMigration.txt";
import repositoryTemplate from "../templates/resources/category/CategoryRepository.txt";
import createCategoryControllerTemplate from "../templates/resources/category/controllers/CreateCategoryController.txt";
import deleteCategoryControllerTemplate from "../templates/resources/category/controllers/DeleteCategoryController.txt";
import getCategoryControllerTemplate from "../templates/resources/category/controllers/GetCategoryController.txt";
import listCategoriesControllerTemplate from "../templates/resources/category/controllers/ListCategoriesController.txt";
import updateCategoryControllerTemplate from "../templates/resources/category/controllers/UpdateCategoryController.txt";
import createCategoryServiceTemplate from "../templates/resources/category/services/CreateCategoryService.txt";
import deleteCategoryServiceTemplate from "../templates/resources/category/services/DeleteCategoryService.txt";
import getCategoryServiceTemplate from "../templates/resources/category/services/GetCategoryService.txt";
import listCategoriesServiceTemplate from "../templates/resources/category/services/ListCategoriesService.txt";
import updateCategoryServiceTemplate from "../templates/resources/category/services/UpdateCategoryService.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceCategoryCommand implements ICommand {
  public getName(): string {
    return "make:resource:category";
  }

  public getDescription(): string {
    return "Generate category resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "category";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Category", module, tableName: "categories" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Category", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateCategory",
        route: { name: "category.create", path: "/categories" as const, method: "POST" as const },
      },
      {
        name: "GetCategory",
        route: { name: "category.get", path: "/categories/:id" as const, method: "GET" as const },
      },
      {
        name: "ListCategories",
        route: { name: "category.list", path: "/categories" as const, method: "GET" as const },
      },
      {
        name: "UpdateCategory",
        route: { name: "category.update", path: "/categories/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteCategory",
        route: { name: "category.delete", path: "/categories/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with category templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateCategoryController.ts"), createCategoryControllerTemplate);
    await Bun.write(join(controllersDir, "GetCategoryController.ts"), getCategoryControllerTemplate);
    await Bun.write(join(controllersDir, "ListCategoriesController.ts"), listCategoriesControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateCategoryController.ts"), updateCategoryControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteCategoryController.ts"), deleteCategoryControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateCategory", "GetCategory", "ListCategories", "UpdateCategory", "DeleteCategory"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with category templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateCategoryService.ts"), createCategoryServiceTemplate);
    await Bun.write(join(servicesDir, "GetCategoryService.ts"), getCategoryServiceTemplate);
    await Bun.write(join(servicesDir, "ListCategoriesService.ts"), listCategoriesServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateCategoryService.ts"), updateCategoryServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteCategoryService.ts"), deleteCategoryServiceTemplate);

    // Replace entity content with category template
    const entityPath = join(process.cwd(), base, "src", "entities", "CategoryEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with category template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with category template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "CategoryRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
