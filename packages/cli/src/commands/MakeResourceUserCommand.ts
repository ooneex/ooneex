import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import entityTemplate from "../templates/resources/user/UserEntity.txt";
import migrationTemplate from "../templates/resources/user/UserMigration.txt";
import repositoryTemplate from "../templates/resources/user/UserRepository.txt";
import banUserControllerTemplate from "../templates/resources/user/controllers/BanUserController.txt";
import deleteUserProfileImageControllerTemplate from "../templates/resources/user/controllers/DeleteUserProfileImageController.txt";
import lockUserControllerTemplate from "../templates/resources/user/controllers/LockUserController.txt";
import signOutControllerTemplate from "../templates/resources/user/controllers/SignOutController.txt";
import updateUserProfileControllerTemplate from "../templates/resources/user/controllers/UpdateUserProfileController.txt";
import updateUserProfileImageControllerTemplate from "../templates/resources/user/controllers/UpdateUserProfileImageController.txt";
import updateUserRolesControllerTemplate from "../templates/resources/user/controllers/UpdateUserRolesController.txt";
import banUserServiceTemplate from "../templates/resources/user/services/BanUserService.txt";
import deleteUserProfileImageServiceTemplate from "../templates/resources/user/services/DeleteUserProfileImageService.txt";
import lockUserServiceTemplate from "../templates/resources/user/services/LockUserService.txt";
import signOutServiceTemplate from "../templates/resources/user/services/SignOutService.txt";
import updateUserProfileImageServiceTemplate from "../templates/resources/user/services/UpdateUserProfileImageService.txt";
import updateUserProfileServiceTemplate from "../templates/resources/user/services/UpdateUserProfileService.txt";
import updateUserRolesServiceTemplate from "../templates/resources/user/services/UpdateUserRolesService.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceUserCommand implements ICommand {
  public getName(): string {
    return "make:resource:user";
  }

  public getDescription(): string {
    return "Generate user resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "user";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "User", module, tableName: "users" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "User", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "BanUser",
        route: { name: "user.ban", path: "/users/:id/ban" as const, method: "PATCH" as const },
      },
      {
        name: "LockUser",
        route: { name: "user.lock", path: "/users/:id/lock" as const, method: "PATCH" as const },
      },
      {
        name: "SignOut",
        route: { name: "user.sign-out", path: "/users/sign-out" as const, method: "POST" as const },
      },
      {
        name: "UpdateUserProfile",
        route: { name: "user.profile.update", path: "/users/:id/profile" as const, method: "PATCH" as const },
      },
      {
        name: "UpdateUserProfileImage",
        route: {
          name: "user.profile.image.update",
          path: "/users/:id/profile/image" as const,
          method: "PATCH" as const,
        },
      },
      {
        name: "DeleteUserProfileImage",
        route: {
          name: "user.profile.image.delete",
          path: "/users/:id/profile/image" as const,
          method: "DELETE" as const,
        },
      },
      {
        name: "UpdateUserRoles",
        route: { name: "user.roles.update", path: "/users/:id/roles" as const, method: "PATCH" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with user templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "BanUserController.ts"), banUserControllerTemplate);
    await Bun.write(join(controllersDir, "LockUserController.ts"), lockUserControllerTemplate);
    await Bun.write(join(controllersDir, "SignOutController.ts"), signOutControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateUserProfileController.ts"), updateUserProfileControllerTemplate);
    await Bun.write(
      join(controllersDir, "UpdateUserProfileImageController.ts"),
      updateUserProfileImageControllerTemplate,
    );
    await Bun.write(
      join(controllersDir, "DeleteUserProfileImageController.ts"),
      deleteUserProfileImageControllerTemplate,
    );
    await Bun.write(join(controllersDir, "UpdateUserRolesController.ts"), updateUserRolesControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = [
      "BanUser",
      "LockUser",
      "SignOut",
      "UpdateUserProfile",
      "UpdateUserProfileImage",
      "DeleteUserProfileImage",
      "UpdateUserRoles",
    ];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with user templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "BanUserService.ts"), banUserServiceTemplate);
    await Bun.write(join(servicesDir, "LockUserService.ts"), lockUserServiceTemplate);
    await Bun.write(join(servicesDir, "SignOutService.ts"), signOutServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateUserProfileService.ts"), updateUserProfileServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateUserProfileImageService.ts"), updateUserProfileImageServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteUserProfileImageService.ts"), deleteUserProfileImageServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateUserRolesService.ts"), updateUserRolesServiceTemplate);

    // Replace entity content with user template
    const entityPath = join(process.cwd(), base, "src", "entities", "UserEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with user template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with user template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "UserRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
