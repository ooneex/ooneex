import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import entityTemplate from "../templates/resources/note/NoteEntity.txt";
import migrationTemplate from "../templates/resources/note/NoteMigration.txt";
import repositoryTemplate from "../templates/resources/note/NoteRepository.txt";
import createNoteControllerTemplate from "../templates/resources/note/controllers/CreateNoteController.txt";
import deleteNoteControllerTemplate from "../templates/resources/note/controllers/DeleteNoteController.txt";
import getNoteControllerTemplate from "../templates/resources/note/controllers/GetNoteController.txt";
import listNotesControllerTemplate from "../templates/resources/note/controllers/ListNotesController.txt";
import updateNoteControllerTemplate from "../templates/resources/note/controllers/UpdateNoteController.txt";
import createNoteServiceTemplate from "../templates/resources/note/services/CreateNoteService.txt";
import deleteNoteServiceTemplate from "../templates/resources/note/services/DeleteNoteService.txt";
import getNoteServiceTemplate from "../templates/resources/note/services/GetNoteService.txt";
import listNotesServiceTemplate from "../templates/resources/note/services/ListNotesService.txt";
import updateNoteServiceTemplate from "../templates/resources/note/services/UpdateNoteService.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceNoteCommand implements ICommand {
  public getName(): string {
    return "make:resource:note";
  }

  public getDescription(): string {
    return "Generate note resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "note";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Note", module, tableName: "notes" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Note", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateNote",
        route: { name: "note.create", path: "/notes" as const, method: "POST" as const },
      },
      {
        name: "GetNote",
        route: { name: "note.get", path: "/notes/:id" as const, method: "GET" as const },
      },
      {
        name: "ListNotes",
        route: { name: "note.list", path: "/notes" as const, method: "GET" as const },
      },
      {
        name: "UpdateNote",
        route: { name: "note.update", path: "/notes/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteNote",
        route: { name: "note.delete", path: "/notes/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with note templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateNoteController.ts"), createNoteControllerTemplate);
    await Bun.write(join(controllersDir, "GetNoteController.ts"), getNoteControllerTemplate);
    await Bun.write(join(controllersDir, "ListNotesController.ts"), listNotesControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateNoteController.ts"), updateNoteControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteNoteController.ts"), deleteNoteControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateNote", "GetNote", "ListNotes", "UpdateNote", "DeleteNote"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with note templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateNoteService.ts"), createNoteServiceTemplate);
    await Bun.write(join(servicesDir, "GetNoteService.ts"), getNoteServiceTemplate);
    await Bun.write(join(servicesDir, "ListNotesService.ts"), listNotesServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateNoteService.ts"), updateNoteServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteNoteService.ts"), deleteNoteServiceTemplate);

    // Replace entity content with note template
    const entityPath = join(process.cwd(), base, "src", "entities", "NoteEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with note template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with note template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "NoteRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
