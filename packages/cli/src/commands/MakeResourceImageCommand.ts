import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import createImageControllerTemplate from "../templates/resources/image/controllers/CreateImageController.txt";
import deleteImageControllerTemplate from "../templates/resources/image/controllers/DeleteImageController.txt";
import getImageControllerTemplate from "../templates/resources/image/controllers/GetImageController.txt";
import listImagesControllerTemplate from "../templates/resources/image/controllers/ListImagesController.txt";
import updateImageControllerTemplate from "../templates/resources/image/controllers/UpdateImageController.txt";
import entityTemplate from "../templates/resources/image/ImageEntity.txt";
import migrationTemplate from "../templates/resources/image/ImageMigration.txt";
import repositoryTemplate from "../templates/resources/image/ImageRepository.txt";
import createImageServiceTemplate from "../templates/resources/image/services/CreateImageService.txt";
import deleteImageServiceTemplate from "../templates/resources/image/services/DeleteImageService.txt";
import getImageServiceTemplate from "../templates/resources/image/services/GetImageService.txt";
import listImagesServiceTemplate from "../templates/resources/image/services/ListImagesService.txt";
import updateImageServiceTemplate from "../templates/resources/image/services/UpdateImageService.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceImageCommand implements ICommand {
  public getName(): string {
    return "make:resource:image";
  }

  public getDescription(): string {
    return "Generate image resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "image";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Image", module, tableName: "images" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Image", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateImage",
        route: { name: "image.create", path: "/images" as const, method: "POST" as const },
      },
      {
        name: "GetImage",
        route: { name: "image.get", path: "/images/:id" as const, method: "GET" as const },
      },
      {
        name: "ListImages",
        route: { name: "image.list", path: "/images" as const, method: "GET" as const },
      },
      {
        name: "UpdateImage",
        route: { name: "image.update", path: "/images/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteImage",
        route: { name: "image.delete", path: "/images/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with image templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateImageController.ts"), createImageControllerTemplate);
    await Bun.write(join(controllersDir, "GetImageController.ts"), getImageControllerTemplate);
    await Bun.write(join(controllersDir, "ListImagesController.ts"), listImagesControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateImageController.ts"), updateImageControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteImageController.ts"), deleteImageControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateImage", "GetImage", "ListImages", "UpdateImage", "DeleteImage"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with image templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateImageService.ts"), createImageServiceTemplate);
    await Bun.write(join(servicesDir, "GetImageService.ts"), getImageServiceTemplate);
    await Bun.write(join(servicesDir, "ListImagesService.ts"), listImagesServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateImageService.ts"), updateImageServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteImageService.ts"), deleteImageServiceTemplate);

    // Replace entity content with image template
    const entityPath = join(process.cwd(), base, "src", "entities", "ImageEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with image template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with image template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "ImageRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
