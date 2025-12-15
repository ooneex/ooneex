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
  public delete = () => {
    const response = new HttpResponse();
    return response.json({ success: true });
  };
}

describe("generateRouteHook", () => {
  const outputDir = join(process.cwd(), "src/hooks");

  test("generates hook file with minimal config", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: MockController,
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

    // Verify hook name is in PascalCase with use prefix
    expect(content).toContain("export const useApiUsersList");

    // Verify it imports useQuery for GET request
    expect(content).toContain("import { useQuery } from '@tanstack/react-query';");
  });

  test("generates hook file for GET request with params", async () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/api/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user by ID",
      isSocket: false,
      params: {
        id: type("string"),
      },
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersShow.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersShow");

    // Verify it's a query hook for GET
    expect(content).toContain("import { useQuery } from '@tanstack/react-query';");

    // Verify params are included
    expect(content).toContain("params:");
  });

  test("generates hook file for POST request with payload", async () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/api/users",
      method: "POST",
      controller: MockController,
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

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersCreate");

    // Verify it's a mutation hook for POST
    expect(content).toContain("import { useMutation } from '@tanstack/react-query';");

    // Verify payload type is included
    expect(content).toContain("payload:");
  });

  test("generates hook file for PUT request", async () => {
    const config: RouteConfigType = {
      name: "api.users.store",
      path: "/api/users/:id",
      method: "PUT",
      controller: UserController,
      description: "Store user",
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

    const fileName = "useApiUsersStore.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersStore");

    // Verify it uses mutation for PUT
    expect(content).toContain("import { useMutation } from '@tanstack/react-query';");

    // Verify it uses fetcher.put
    expect(content).toContain("fetcher.put");
  });

  test("generates hook file for PATCH request", async () => {
    const config: RouteConfigType = {
      name: "api.users.edit",
      path: "/api/users/:id",
      method: "PATCH",
      controller: MockController,
      description: "Edit user",
      isSocket: false,
      params: {
        id: type("string"),
      },
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersEdit.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersEdit");

    // Verify it uses mutation for PATCH
    expect(content).toContain("import { useMutation } from '@tanstack/react-query';");

    // Verify it uses fetcher.patch
    expect(content).toContain("fetcher.patch");
  });

  test("generates hook file for DELETE request", async () => {
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

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersDelete");

    // Verify it uses mutation for DELETE
    expect(content).toContain("import { useMutation } from '@tanstack/react-query';");
  });

  test("generates hook file with queries validation", async () => {
    const config: RouteConfigType = {
      name: "api.users.search",
      path: "/api/users",
      method: "GET",
      controller: MockController,
      description: "Search users",
      isSocket: false,
      queries: type({
        q: "string",
        page: "number",
        limit: "number",
      }),
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersSearch.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersSearch");

    // Verify queries type is included
    expect(content).toContain("queries:");
  });

  test("generates hook file with response validation", async () => {
    const config: RouteConfigType = {
      name: "api.users.get",
      path: "/api/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user by ID",
      isSocket: false,
      params: {
        id: type("string"),
      },
      response: type({
        id: "string",
        name: "string",
        email: "string",
      }),
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersGet.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersGet");

    // Verify response type is included
    expect(content).toContain("response:");
  });

  test("generates hook file with all validation types", async () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/api/users/:id",
      method: "PUT",
      controller: UserController,
      description: "Full update user",
      isSocket: false,
      params: {
        id: type("string"),
      },
      queries: type({
        notify: "boolean",
      }),
      payload: type({
        name: "string",
        email: "string",
      }),
      response: type({
        id: "string",
        name: "string",
        email: "string",
        updatedAt: "string",
      }),
    };

    await generateRouteHook(config);

    const fileName = "useApiUsersUpdate.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiUsersUpdate");

    // Verify all type properties are included
    expect(content).toContain("params:");
    expect(content).toContain("queries:");
    expect(content).toContain("payload:");
    expect(content).toContain("response:");
  });

  test("converts route name to PascalCase correctly in filename", async () => {
    const config: RouteConfigType = {
      name: "api.v1.organizations.departments.list",
      path: "/api/v1/organizations/departments",
      method: "GET",
      controller: MockController,
      description: "List departments",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiV1OrganizationsDepartmentsList.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created with correct PascalCase filename
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify hook name is in PascalCase with all parts capitalized
    expect(content).toContain("export const useApiV1OrganizationsDepartmentsList");
  });

  test("overwrites existing hook file with same route name", async () => {
    const config: RouteConfigType = {
      name: "api.overwrite.test",
      path: "/api/overwrite",
      method: "GET",
      controller: MockController,
      description: "Original description",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiOverwriteTest.ts";
    const filePath = join(outputDir, fileName);
    const file = Bun.file(filePath);

    const originalContent = await file.text();
    expect(originalContent).toContain("export const useApiOverwriteTest");

    // Update and regenerate
    config.description = "Updated description";
    await generateRouteHook(config);

    const updatedFile = Bun.file(filePath);
    const updatedContent = await updatedFile.text();

    // File should still exist and contain the same hook structure
    expect(await updatedFile.exists()).toBe(true);
    expect(updatedContent).toContain("export const useApiOverwriteTest");
  });

  test("generates valid TypeScript syntax", async () => {
    const config: RouteConfigType = {
      name: "api.syntax.test",
      path: "/api/syntax",
      method: "POST",
      controller: MockController,
      description: "Test TypeScript syntax",
      isSocket: false,
      payload: type({
        title: "string",
        count: "number",
      }),
      response: type({
        success: "boolean",
      }),
    };

    await generateRouteHook(config);

    const fileName = "useApiSyntaxTest.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify it contains export statement
    expect(content).toMatch(/export const use\w+ =/);

    // Verify it has opening and closing braces
    expect(content).toContain("{");
    expect(content).toContain("}");

    // Verify semicolons are present
    expect(content).toContain(";");

    // Verify it includes Fetcher import
    expect(content).toContain("import { Fetcher } from '@ooneex/fetcher';");
  });

  test("generates hook with correct file path in src/hooks directory", async () => {
    const config: RouteConfigType = {
      name: "api.directory.test",
      path: "/api/directory",
      method: "GET",
      controller: MockController,
      description: "Test directory structure",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiDirectoryTest.ts";
    const expectedPath = join(process.cwd(), "src/hooks", fileName);

    // Verify file exists in correct location
    const file = Bun.file(expectedPath);
    expect(await file.exists()).toBe(true);
  });

  test("handles simple route names correctly", async () => {
    const config: RouteConfigType = {
      name: "api.status.health",
      path: "/health",
      method: "GET",
      controller: MockController,
      description: "Health check",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiStatusHealth.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify hook name
    expect(content).toContain("export const useApiStatusHealth");
  });

  test("handles HEAD request as query", async () => {
    const config: RouteConfigType = {
      name: "api.resource.check",
      path: "/resource",
      method: "HEAD",
      controller: MockController,
      description: "Resource check",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiResourceCheck.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // HEAD requests should use useQuery
    expect(content).toContain("import { useQuery } from '@tanstack/react-query';");
  });

  test("handles OPTIONS request as query", async () => {
    const config: RouteConfigType = {
      name: "api.resource.list",
      path: "/resource",
      method: "OPTIONS",
      controller: MockController,
      description: "Resource options",
      isSocket: false,
    };

    await generateRouteHook(config);

    const fileName = "useApiResourceList.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // OPTIONS requests should use useQuery
    expect(content).toContain("import { useQuery } from '@tanstack/react-query';");
  });

  test("includes type definitions in generated hook", async () => {
    const config: RouteConfigType = {
      name: "api.typed.create",
      path: "/api/typed",
      method: "POST",
      controller: MockController,
      description: "Typed endpoint",
      isSocket: false,
      payload: type({
        data: "string",
      }),
    };

    await generateRouteHook(config);

    const fileName = "useApiTypedCreate.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type definition is included
    expect(content).toContain("export type");
    expect(content).toContain("RouteConfigType");
  });

  afterAll(async () => {
    await Bun.spawn(["rm", "-rf", outputDir]).exited;
  });
});
