import { afterAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { IController } from "@ooneex/controller";
import { HttpResponse } from "@ooneex/http-response";
import type { RouteConfigType } from "@ooneex/routing";
import { type } from "arktype";
import { generateRouteFetcher } from "@/generateRouteFetcher";

// Mock controller for testing
class MockController implements IController {
  public index = () => {
    const response = new HttpResponse();
    return response.json({});
  };
}

class UserController implements IController {
  public index = () => {
    const response = new HttpResponse();
    return response.json({});
  };
  public list = () => {
    const response = new HttpResponse();
    return response.json({});
  };
  public get = () => {
    const response = new HttpResponse();
    return response.json({});
  };
  public create = () => {
    const response = new HttpResponse();
    return response.json({});
  };
  public update = () => {
    const response = new HttpResponse();
    return response.json({});
  };
  public delete = () => {
    const response = new HttpResponse();
    return response.json({ success: true });
  };
}

describe("generateRouteFetcher", () => {
  const outputDir = join(process.cwd(), "src/fetchers");

  test("generates fetcher file with minimal config", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: UserController,
      description: "List all users",
      isSocket: false,
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersListFetcher.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify imports are present
    expect(content).toContain('import type { ResponseDataType } from "@ooneex/http-response"');
    expect(content).toContain('import { Fetcher } from "@ooneex/fetcher"');

    // Verify class definition is present
    expect(content).toContain("export class ApiUsersListFetcher");
    expect(content).toContain("public async list(");

    // Verify method uses correct HTTP method
    expect(content).toContain("fetcher.get<");
  });

  test("generates fetcher file for GET route with parameters", async () => {
    const config: RouteConfigType = {
      name: "api.users.get",
      path: "/api/users/:id",
      method: "GET",
      controller: UserController,
      description: "Get user by ID",
      isSocket: false,
      params: {
        id: type("string"),
      },
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersGetFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition includes params
    expect(content).toContain("export type GetRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiUsersGetFetcher");
    expect(content).toContain("public async get(");

    // Verify params are in config
    expect(content).toContain('params: GetRouteConfigType["params"]');

    // Verify URL construction with params
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.id}");
  });

  test("generates fetcher file for POST route with payload", async () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/api/users",
      method: "POST",
      controller: UserController,
      description: "Create a new user",
      isSocket: false,
      payload: type({
        name: "string",
        email: "string",
        age: "number",
      }),
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersCreateFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition includes payload
    expect(content).toContain("export type CreateRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiUsersCreateFetcher");
    expect(content).toContain("public async create(");

    // Verify payload is in config
    expect(content).toContain('payload: CreateRouteConfigType["payload"]');

    // Verify POST method is used
    expect(content).toContain("fetcher.post<");

    // Verify payload is passed to fetcher
    expect(content).toContain("config.payload");
  });

  test("generates fetcher file for PUT route with params and payload", async () => {
    const config: RouteConfigType = {
      name: "api.profiles.update",
      path: "/api/profiles/:id",
      method: "PUT",
      controller: UserController,
      description: "Update profile",
      isSocket: false,
      params: {
        id: type("string"),
      },
      payload: type({
        name: "string",
        email: "string",
      }),
    };

    await generateRouteFetcher(config);

    const fileName = "ApiProfilesUpdateFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition
    expect(content).toContain("export type UpdateRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiProfilesUpdateFetcher");
    expect(content).toContain("public async update(");

    // Verify both params and payload are in config
    expect(content).toContain('params: UpdateRouteConfigType["params"]');
    expect(content).toContain('payload: UpdateRouteConfigType["payload"]');

    // Verify PUT method is used
    expect(content).toContain("fetcher.put<");

    // Verify URL with params and payload
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.id}");
    expect(content).toContain("config.payload");
  });

  test("generates fetcher file for PATCH route", async () => {
    const config: RouteConfigType = {
      name: "api.settings.update",
      path: "/api/settings/:id",
      method: "PATCH",
      controller: UserController,
      description: "Partially update settings",
      isSocket: false,
      params: {
        id: type("string"),
      },
      payload: type({
        name: "string?",
      }),
    };

    await generateRouteFetcher(config);

    const fileName = "ApiSettingsUpdateFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify PATCH method is used
    expect(content).toContain("fetcher.patch<");
    expect(content).toContain("config.payload");
  });

  test("generates fetcher file for DELETE route", async () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/api/users/:id",
      method: "DELETE",
      controller: UserController,
      description: "Delete user",
      isSocket: false,
      params: {
        id: type("string"),
      },
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersDeleteFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition
    expect(content).toContain("export type DeleteRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiUsersDeleteFetcher");
    expect(content).toContain("public async delete(");

    // Verify DELETE method is used
    expect(content).toContain("fetcher.delete<");
  });

  test("generates fetcher file with query parameters", async () => {
    const config: RouteConfigType = {
      name: "api.users.search",
      path: "/api/users/search",
      method: "GET",
      controller: UserController,
      description: "Search users",
      isSocket: false,
      queries: type({
        page: "number?",
        limit: "number?",
        search: "string?",
      }),
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersSearchFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify queries are in config
    expect(content).toContain('queries: SearchRouteConfigType["queries"]');

    // Verify URLSearchParams is used
    expect(content).toContain("URLSearchParams");
    expect(content).toContain("config.queries");
  });

  test("generates fetcher file with params, queries, and payload", async () => {
    const config: RouteConfigType = {
      name: "api.memberships.update",
      path: "/api/orgs/:orgId/members/:memberId",
      method: "PUT",
      controller: UserController,
      description: "Update organization member",
      isSocket: false,
      params: {
        orgId: type("string"),
        memberId: type("string"),
      },
      queries: type({
        notify: "boolean?",
      }),
      payload: type({
        role: "string",
        active: "boolean",
      }),
    };

    await generateRouteFetcher(config);

    const fileName = "ApiMembershipsUpdateFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify all config parts are present
    expect(content).toContain('params: UpdateRouteConfigType["params"]');
    expect(content).toContain('queries: UpdateRouteConfigType["queries"]');
    expect(content).toContain('payload: UpdateRouteConfigType["payload"]');

    // Verify URL construction with multiple params
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.orgId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.memberId}");

    // Verify query string handling
    expect(content).toContain("URLSearchParams");

    // Verify payload is passed
    expect(content).toContain("config.payload");
  });

  test("generates fetcher file with multiple path parameters", async () => {
    const config: RouteConfigType = {
      name: "api.orgs.projects.tasks.get",
      path: "/api/orgs/:orgId/projects/:projectId/tasks/:taskId",
      method: "GET",
      controller: UserController,
      description: "Get task details",
      isSocket: false,
      params: {
        orgId: type("string"),
        projectId: type("string"),
        taskId: type("string"),
      },
    };

    await generateRouteFetcher(config);

    const fileName = "ApiOrgsProjectsTasksGetFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify all params are referenced in URL
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.orgId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.projectId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.taskId}");
  });

  test("overwrites existing fetcher file with same route name", async () => {
    const config: RouteConfigType = {
      name: "api.users.index",
      path: "/api/test",
      method: "GET",
      controller: MockController,
      description: "Test overwrite",
      isSocket: false,
    };

    // Generate first time
    await generateRouteFetcher(config);

    const fileName = "ApiUsersIndexFetcher.ts";
    const filePath = join(outputDir, fileName);
    const file = Bun.file(filePath);
    const firstContent = await file.text();

    // Generate second time
    await generateRouteFetcher(config);

    const updatedFile = Bun.file(filePath);
    const secondContent = await updatedFile.text();

    // Both should exist and be identical
    expect(await file.exists()).toBe(true);
    expect(await updatedFile.exists()).toBe(true);
    expect(firstContent).toBe(secondContent);
  });

  test("generates fetcher file with response type", async () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/api/users/:id",
      method: "GET",
      controller: UserController,
      description: "Get user with response type",
      isSocket: false,
      params: {
        id: type("string"),
      },
      response: type({
        id: "string",
        name: "string",
        email: "string",
        createdAt: "string",
      }),
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersShowFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify response type is used in return type
    expect(content).toContain('Promise<ResponseDataType<ShowRouteConfigType["response"]>>');
  });

  test("generates fetcher with proper class naming from route name", async () => {
    const config: RouteConfigType = {
      name: "api.v2.users.list",
      path: "/api/v2/users",
      method: "GET",
      controller: UserController,
      description: "List users v2",
      isSocket: false,
    };

    await generateRouteFetcher(config);

    const fileName = "ApiV2UsersListFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify class name follows PascalCase naming convention
    expect(content).toContain("export class ApiV2UsersListFetcher");
  });

  test("generates fetcher for root path", async () => {
    const config: RouteConfigType = {
      name: "api.users.index",
      path: "/",
      method: "GET",
      controller: MockController,
      description: "Root endpoint",
      isSocket: false,
    };

    await generateRouteFetcher(config);

    const fileName = "ApiUsersIndexFetcher.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify class is generated correctly
    expect(content).toContain("export class ApiUsersIndexFetcher");
    expect(content).toContain("public async index(");
  });

  afterAll(async () => {
    await Bun.spawn(["rm", "-rf", outputDir]).exited;
  });
});
