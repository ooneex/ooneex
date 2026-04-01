import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import createVideoControllerTemplate from "../templates/resources/video/controllers/CreateVideoController.txt";
import deleteVideoControllerTemplate from "../templates/resources/video/controllers/DeleteVideoController.txt";
import getVideoControllerTemplate from "../templates/resources/video/controllers/GetVideoController.txt";
import listVideosControllerTemplate from "../templates/resources/video/controllers/ListVideosController.txt";
import updateVideoControllerTemplate from "../templates/resources/video/controllers/UpdateVideoController.txt";
import createVideoServiceTemplate from "../templates/resources/video/services/CreateVideoService.txt";
import deleteVideoServiceTemplate from "../templates/resources/video/services/DeleteVideoService.txt";
import getVideoServiceTemplate from "../templates/resources/video/services/GetVideoService.txt";
import listVideosServiceTemplate from "../templates/resources/video/services/ListVideosService.txt";
import updateVideoServiceTemplate from "../templates/resources/video/services/UpdateVideoService.txt";
import entityTemplate from "../templates/resources/video/VideoEntity.txt";
import migrationTemplate from "../templates/resources/video/VideoMigration.txt";
import repositoryTemplate from "../templates/resources/video/VideoRepository.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceVideoCommand implements ICommand {
  public getName(): string {
    return "make:resource:video";
  }

  public getDescription(): string {
    return "Generate video resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "video";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Video", module, tableName: "videos" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Video", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateVideo",
        route: { name: "video.create", path: "/videos" as const, method: "POST" as const },
      },
      {
        name: "GetVideo",
        route: { name: "video.get", path: "/videos/:id" as const, method: "GET" as const },
      },
      {
        name: "ListVideos",
        route: { name: "video.list", path: "/videos" as const, method: "GET" as const },
      },
      {
        name: "UpdateVideo",
        route: { name: "video.update", path: "/videos/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteVideo",
        route: { name: "video.delete", path: "/videos/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with video templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateVideoController.ts"), createVideoControllerTemplate);
    await Bun.write(join(controllersDir, "GetVideoController.ts"), getVideoControllerTemplate);
    await Bun.write(join(controllersDir, "ListVideosController.ts"), listVideosControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateVideoController.ts"), updateVideoControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteVideoController.ts"), deleteVideoControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateVideo", "GetVideo", "ListVideos", "UpdateVideo", "DeleteVideo"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with video templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateVideoService.ts"), createVideoServiceTemplate);
    await Bun.write(join(servicesDir, "GetVideoService.ts"), getVideoServiceTemplate);
    await Bun.write(join(servicesDir, "ListVideosService.ts"), listVideosServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateVideoService.ts"), updateVideoServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteVideoService.ts"), deleteVideoServiceTemplate);

    // Replace entity content with video template
    const entityPath = join(process.cwd(), base, "src", "entities", "VideoEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with video template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with video template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "VideoRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
