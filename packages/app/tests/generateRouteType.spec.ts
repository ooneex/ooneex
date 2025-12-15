import { afterAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { IController } from "@ooneex/controller";
import { HttpResponse } from "@ooneex/http-response";
import type { RouteConfigType } from "@ooneex/routing";
import { type } from "arktype";
import { generateRouteType } from "@/generateRouteType";

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

describe("generateRouteType", () => {
  const outputDir = join(process.cwd(), "src/types/routes");

  test("generates route type file with minimal config", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: MockController,
      description: "List all users",
      isSocket: false,
    };

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with RouteType suffix
    expect(content).toContain("export type ApiUsersListRouteType =");

    // Verify it generates 'never' for routes without validation
    expect(content).toContain("never");
  });

  test("generates route type file with params validation", async () => {
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

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with RouteType suffix
    expect(content).toContain("export type ApiUsersShowRouteType =");

    // Verify params type is included
    expect(content).toContain("params:");
  });

  test("generates route type file with payload validation", async () => {
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

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with RouteType suffix
    expect(content).toContain("export type ApiUsersCreateRouteType =");

    // Verify payload type is included
    expect(content).toContain("payload:");
  });

  test("generates route type file with queries validation", async () => {
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

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with RouteType suffix
    expect(content).toContain("export type ApiUsersSearchRouteType =");

    // Verify queries type is included
    expect(content).toContain("queries:");
  });

  test("generates route type file with response validation", async () => {
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

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with RouteType suffix
    expect(content).toContain("export type ApiUsersGetRouteType =");

    // Verify response type is included
    expect(content).toContain("response:");
  });

  test("generates route type file with all validation types", async () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/api/users/:id",
      method: "PUT",
      controller: UserController,
      description: "Update user",
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

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with RouteType suffix
    expect(content).toContain("export type ApiUsersUpdateRouteType =");

    // Verify all type properties are included
    expect(content).toContain("params:");
    expect(content).toContain("queries:");
    expect(content).toContain("payload:");
    expect(content).toContain("response:");
  });

  test("converts route name to PascalCase correctly", async () => {
    const config: RouteConfigType = {
      name: "api.v1.organizations.departments.list",
      path: "/api/v1/organizations/departments",
      method: "GET",
      controller: MockController,
      description: "List departments",
      isSocket: false,
    };

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify type name is in PascalCase with all parts capitalized and RouteType suffix
    expect(content).toContain("export type ApiV1OrganizationsDepartmentsListRouteType =");
  });

  test("overwrites existing type file with same route name", async () => {
    const config: RouteConfigType = {
      name: "api.overwrite.test",
      path: "/api/overwrite",
      method: "GET",
      controller: MockController,
      description: "Original description",
      isSocket: false,
    };

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);
    const file = Bun.file(filePath);

    const originalContent = await file.text();
    expect(originalContent).toContain("export type ApiOverwriteTestRouteType =");

    // Update and regenerate
    config.description = "Updated description";
    await generateRouteType(config);

    const updatedFile = Bun.file(filePath);
    const updatedContent = await updatedFile.text();

    // File should still exist and contain the same structure
    expect(await updatedFile.exists()).toBe(true);
    expect(updatedContent).toContain("export type ApiOverwriteTestRouteType =");
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

    await generateRouteType(config);

    const fileName = `${config.name}.ts`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify it contains export statement with RouteType suffix
    expect(content).toMatch(/export type \w+RouteType =/);

    // Verify it has opening and closing braces
    expect(content).toContain("{");
    expect(content).toContain("}");

    // Verify semicolons are present
    expect(content).toContain(";");
  });

  afterAll(async () => {
    await Bun.spawn(["rm", "-rf", outputDir]).exited;
  });
});
