import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import entityTemplate from "../templates/resources/book/BookEntity.txt";
import migrationTemplate from "../templates/resources/book/BookMigration.txt";
import repositoryTemplate from "../templates/resources/book/BookRepository.txt";
import createBookControllerTemplate from "../templates/resources/book/controllers/CreateBookController.txt";
import deleteBookControllerTemplate from "../templates/resources/book/controllers/DeleteBookController.txt";
import getBookControllerTemplate from "../templates/resources/book/controllers/GetBookController.txt";
import listBooksControllerTemplate from "../templates/resources/book/controllers/ListBooksController.txt";
import updateBookControllerTemplate from "../templates/resources/book/controllers/UpdateBookController.txt";
import createBookServiceTemplate from "../templates/resources/book/services/CreateBookService.txt";
import deleteBookServiceTemplate from "../templates/resources/book/services/DeleteBookService.txt";
import getBookServiceTemplate from "../templates/resources/book/services/GetBookService.txt";
import listBooksServiceTemplate from "../templates/resources/book/services/ListBooksService.txt";
import updateBookServiceTemplate from "../templates/resources/book/services/UpdateBookService.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceBookCommand implements ICommand {
  public getName(): string {
    return "make:resource:book";
  }

  public getDescription(): string {
    return "Generate book resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "book";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Book", module, tableName: "books" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Book", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      { name: "CreateBook", route: { name: "book.create", path: "/books" as const, method: "POST" as const } },
      { name: "GetBook", route: { name: "book.get", path: "/books/:id" as const, method: "GET" as const } },
      { name: "ListBooks", route: { name: "book.list", path: "/books" as const, method: "GET" as const } },
      { name: "UpdateBook", route: { name: "book.update", path: "/books/:id" as const, method: "PATCH" as const } },
      { name: "DeleteBook", route: { name: "book.delete", path: "/books/:id" as const, method: "DELETE" as const } },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with book templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateBookController.ts"), createBookControllerTemplate);
    await Bun.write(join(controllersDir, "GetBookController.ts"), getBookControllerTemplate);
    await Bun.write(join(controllersDir, "ListBooksController.ts"), listBooksControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateBookController.ts"), updateBookControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteBookController.ts"), deleteBookControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateBook", "GetBook", "ListBooks", "UpdateBook", "DeleteBook"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with book templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateBookService.ts"), createBookServiceTemplate);
    await Bun.write(join(servicesDir, "GetBookService.ts"), getBookServiceTemplate);
    await Bun.write(join(servicesDir, "ListBooksService.ts"), listBooksServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateBookService.ts"), updateBookServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteBookService.ts"), deleteBookServiceTemplate);

    // Replace entity content with book template
    const entityPath = join(process.cwd(), base, "src", "entities", "BookEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with book template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with book template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "BookRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
