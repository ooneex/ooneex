import { afterAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { IController } from "@ooneex/controller";
import { HttpResponse } from "@ooneex/http-response";
import type { RouteConfigType } from "@ooneex/routing";
import { type } from "arktype";
import { generateRouteHook } from "@/generateRouteHook";

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

describe("generateRouteHook", () => {
  const outputDir = join(process.cwd(), "src", "hooks", "routes");

  test("generates useQuery hook for GET route with minimal config", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: UserController,
      description: "List all users",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersList.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify imports are present
    expect(content).toContain("import { useQuery } from '@tanstack/react-query'");
    expect(content).toContain("import { Fetcher } from '@ooneex/fetcher'");

    // Verify hook definition is present
    expect(content).toContain("export const useApiUsersList");
    expect(content).toContain("useQuery");
    expect(content).toContain("queryKey:");
    expect(content).toContain("queryFn:");

    // Verify it uses GET method
    expect(content).toContain("fetcher.get<");
  });

  test("generates useQuery hook for GET route with parameters", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiUsersGet.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition includes params
    expect(content).toContain("export type GetRouteConfigType");

    // Verify hook definition
    expect(content).toContain("export const useApiUsersGet");

    // Verify params are in config
    expect(content).toContain('params: GetRouteConfigType["params"]');

    // Verify query key includes params
    expect(content).toContain("config.params.id");

    // Verify URL construction with params
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${config.params.id}");
  });

  test("generates useQuery hook for GET route with query parameters", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiUsersSearch.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify queries are in config
    expect(content).toContain('queries?: SearchRouteConfigType["queries"]');

    // Verify URLSearchParams is used
    expect(content).toContain("URLSearchParams");
    expect(content).toContain("config.queries");
  });

  test("generates useMutation hook for POST route", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiUsersCreate.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify imports for mutation
    expect(content).toContain("import { useMutation } from '@tanstack/react-query'");

    // Verify type definition includes payload
    expect(content).toContain("export type CreateRouteConfigType");

    // Verify hook definition
    expect(content).toContain("export const useApiUsersCreate");
    expect(content).toContain("useMutation");
    expect(content).toContain("mutationFn:");

    // Verify payload is in config
    expect(content).toContain('payload: CreateRouteConfigType["payload"]');

    // Verify POST method is used
    expect(content).toContain("fetcher.post<");

    // Verify payload is passed to fetcher
    expect(content).toContain("config.payload");
  });

  test("generates useMutation hook for PUT route with params and payload", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiProfilesUpdate.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition
    expect(content).toContain("export type UpdateRouteConfigType");

    // Verify hook definition
    expect(content).toContain("export const useApiProfilesUpdate");
    expect(content).toContain("useMutation");

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

  test("generates useMutation hook for PATCH route", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiSettingsUpdate.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify PATCH method is used
    expect(content).toContain("fetcher.patch<");
    expect(content).toContain("config.payload");
  });

  test("generates useMutation hook for DELETE route", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiUsersDelete.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition
    expect(content).toContain("export type DeleteRouteConfigType");

    // Verify hook definition
    expect(content).toContain("export const useApiUsersDelete");
    expect(content).toContain("useMutation");

    // Verify DELETE method is used
    expect(content).toContain("fetcher.delete<");
  });

  test("generates hook with response type", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiUsersShow.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify response type is used
    expect(content).toContain('ShowRouteConfigType["response"]');
  });

  test("generates hook with proper naming from route name", async () => {
    const config: RouteConfigType = {
      name: "api.v2.users.list",
      path: "/api/v2/users",
      method: "GET",
      controller: UserController,
      description: "List users v2",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiV2UsersList.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify hook name follows naming convention
    expect(content).toContain("export const useApiV2UsersList");
  });

  test("generates useMutation hook with params, queries, and payload", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiMembershipsUpdate.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify all config parts are present
    expect(content).toContain('params: UpdateRouteConfigType["params"]');
    expect(content).toContain('queries?: UpdateRouteConfigType["queries"]');
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

  test("generates hook with multiple path parameters for GET", async () => {
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

    await generateRouteHook(config);

    const fileName = "useApiOrgsProjectsTasksGet.ts";
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

    // Verify query key includes all params
    expect(content).toContain("config.params.orgId");
    expect(content).toContain("config.params.projectId");
    expect(content).toContain("config.params.taskId");
  });

  test("overwrites existing hook file with same route name", async () => {
    const config: RouteConfigType = {
      name: "api.users.index",
      path: "/api/test",
      method: "GET",
      controller: MockController,
      description: "Test overwrite",
      isSocket: false,
    };

    // Generate first time
    await generateRouteHook(config);

    const fileName = "useApiUsersIndex.ts";
    const filePath = join(outputDir, fileName);
    const file = Bun.file(filePath);
    const firstContent = await file.text();

    // Generate second time
    await generateRouteHook(config);

    const updatedFile = Bun.file(filePath);
    const secondContent = await updatedFile.text();

    // Both should exist and be identical
    expect(await file.exists()).toBe(true);
    expect(await updatedFile.exists()).toBe(true);
    expect(firstContent).toBe(secondContent);
  });

  test("generates useQuery hook for HEAD method", async () => {
    const config: RouteConfigType = {
      name: "api.users.check",
      path: "/api/users/:id",
      method: "HEAD",
      controller: UserController,
      description: "Check if user exists",
      isSocket: false,
      params: {
        id: type("string"),
      },
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersCheck.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // HEAD should use useQuery
    expect(content).toContain("import { useQuery } from '@tanstack/react-query'");
    expect(content).toContain("useQuery");
    expect(content).toContain("fetcher.head<");
  });

  test("generates useQuery hook for OPTIONS method", async () => {
    const config: RouteConfigType = {
      name: "api.users.config",
      path: "/api/users",
      method: "OPTIONS",
      controller: UserController,
      description: "Get options for users endpoint",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersConfig.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // OPTIONS should use useQuery
    expect(content).toContain("import { useQuery } from '@tanstack/react-query'");
    expect(content).toContain("useQuery");
    expect(content).toContain("fetcher.options<");
  });

  afterAll(async () => {
    await Bun.spawn(["rm", "-rf", outputDir]).exited;
  });
});
