import { afterAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { Environment } from "@ooneex/app-env";
import type { IController } from "@ooneex/controller";
import { HttpResponse } from "@ooneex/http-response";
import { ERole } from "@ooneex/role";
import type { RouteConfigType } from "@ooneex/routing";
import { type } from "arktype";
import { generateRouteDoc } from "@/generateRouteDoc";

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

describe("generateRouteDoc", () => {
  const outputDir = join(process.cwd(), "docs/routes");

  test("generates route documentation file with minimal config", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: MockController,
      description: "List all users",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read and parse the generated file
    const parsedDoc = await file.json();

    // Verify document structure and content
    expect(parsedDoc.name).toBe("api.users.list");
    expect(parsedDoc.path).toBe("/api/users");
    expect(parsedDoc.method).toBe("GET");
    expect(parsedDoc.description).toBe("List all users");
    expect(parsedDoc.isSocket).toBe(false);
    expect(parsedDoc.parameters).toEqual([]);
  });

  test("generates route documentation file with route parameters", async () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/api/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user by ID",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read and parse the generated file
    const parsedDoc = await file.json();

    // Verify document structure and content
    expect(parsedDoc.name).toBe("api.users.show");
    expect(parsedDoc.path).toBe("/api/users/:id");
    expect(parsedDoc.method).toBe("GET");
    expect(parsedDoc.description).toBe("Get user by ID");
    expect(parsedDoc.isSocket).toBe(false);
    expect(parsedDoc.parameters).toEqual(["id"]);
  });

  test("generates route documentation file with multiple parameters", async () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/api/users/:id/emails/:emailId",
      method: "DELETE",
      controller: UserController,
      description: "Delete user email by ID",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.name).toBe("api.users.delete");
    expect(parsedDoc.path).toBe("/api/users/:id/emails/:emailId");
    expect(parsedDoc.method).toBe("DELETE");
    expect(parsedDoc.description).toBe("Delete user email by ID");
    expect(parsedDoc.parameters).toEqual(["id", "emailId"]);
  });

  test("generates route documentation file for WebSocket route", async () => {
    const config: RouteConfigType = {
      name: "api.chat.connect",
      path: "/api/chat",
      method: "GET",
      controller: MockController,
      description: "Connect to chat WebSocket",
      isSocket: true,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.name).toBe("api.chat.connect");
    expect(parsedDoc.isSocket).toBe(true);
    expect(parsedDoc.method).toBe("GET");
  });

  test("generates route documentation with isSocket true for WebSocket with parameters", async () => {
    const config: RouteConfigType = {
      name: "api.notifications.connect",
      path: "/api/notifications/:userId",
      method: "GET",
      controller: MockController,
      description: "Connect to real-time notifications via WebSocket",
      isSocket: true,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.name).toBe("api.notifications.connect");
    expect(parsedDoc.isSocket).toBe(true);
    expect(parsedDoc.path).toBe("/api/notifications/:userId");
    expect(parsedDoc.parameters).toEqual(["userId"]);
  });

  test("generates route documentation with isSocket false explicitly set", async () => {
    const config: RouteConfigType = {
      name: "api.health.check",
      path: "/api/health",
      method: "GET",
      controller: MockController,
      description: "Health check endpoint",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.name).toBe("api.health.check");
    expect(parsedDoc.isSocket).toBe(false);
    expect(parsedDoc.method).toBe("GET");
    expect(parsedDoc.description).toBe("Health check endpoint");
  });

  test("generates route documentation with nested path segments", async () => {
    const config: RouteConfigType = {
      name: "api.organizations.list",
      path: "/api/v1/organizations/departments/teams",
      method: "GET",
      controller: MockController,
      description: "List teams in organization departments",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.path).toBe("/api/v1/organizations/departments/teams");
    expect(parsedDoc.parameters).toEqual([]);
  });

  test("generates route documentation with complex parameter pattern", async () => {
    const config: RouteConfigType = {
      name: "api.resources.update",
      path: "/api/:version/users/:userId/posts/:postId/comments/:commentId",
      method: "PUT",
      controller: MockController,
      description: "Update nested resource",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.parameters).toEqual(["version", "userId", "postId", "commentId"]);
    expect(parsedDoc.path).toBe("/api/:version/users/:userId/posts/:postId/comments/:commentId");
  });

  test("generates JSON with proper formatting (indentation)", async () => {
    const config: RouteConfigType = {
      name: "api.format.test",
      path: "/api/format",
      method: "GET",
      controller: MockController,
      description: "Test JSON formatting",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    const rawContent = await file.text();

    // Verify file is formatted with 2-space indentation
    expect(rawContent).toContain("\n  ");
    // Verify it's valid JSON
    expect(() => JSON.parse(rawContent)).not.toThrow();
    // Verify it matches the pretty-printed format
    const parsed = JSON.parse(rawContent);
    expect(rawContent).toBe(JSON.stringify(parsed, null, 2));
  });

  test("handles route names with special characters in description", async () => {
    const config: RouteConfigType = {
      name: "api.users.search",
      path: "/api/users",
      method: "GET",
      controller: MockController,
      description: 'Search users by "name" & email with special chars: <, >, &',
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    const parsedDoc = await file.json();

    expect(parsedDoc.description).toBe('Search users by "name" & email with special chars: <, >, &');
  });

  test("generates documentation for root path routes", async () => {
    const config: RouteConfigType = {
      name: "api.home.index",
      path: "/",
      method: "GET",
      controller: MockController,
      description: "Home page",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    const parsedDoc = await file.json();

    expect(parsedDoc.path).toBe("/");
    expect(parsedDoc.parameters).toEqual([]);
  });

  test("overwrites existing documentation file with same route name", async () => {
    const config: RouteConfigType = {
      name: "api.overwrite.test",
      path: "/api/overwrite",
      method: "GET",
      controller: MockController,
      description: "Original description",
      isSocket: false,
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);
    const file = Bun.file(filePath);
    const firstDoc = await file.json();

    expect(firstDoc.description).toBe("Original description");

    // Update and regenerate
    config.description = "Updated description";
    await generateRouteDoc(config);

    const updatedFile = Bun.file(filePath);
    const secondDoc = await updatedFile.json();

    expect(secondDoc.description).toBe("Updated description");
  });

  test("generates route documentation with params validation schema", async () => {
    const config: RouteConfigType = {
      name: "api.products.show",
      path: "/api/products/:id",
      method: "GET",
      controller: MockController,
      description: "Get product by ID",
      isSocket: false,
      params: {
        id: type("string"),
      },
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    const paramsSchema = schemas.params as Record<string, unknown>;
    expect(paramsSchema.type).toBe("object");
    expect(paramsSchema.properties).toBeDefined();
    const properties = paramsSchema.properties as Record<string, unknown>;
    const idProperty = properties.id as Record<string, unknown>;
    expect(idProperty.required).toBe(true);
  });

  test("generates route documentation with multiple params validation schemas", async () => {
    const config: RouteConfigType = {
      name: "api.organizations.update",
      path: "/api/organizations/:orgId/members/:memberId",
      method: "PUT",
      controller: UserController,
      description: "Update organization member",
      isSocket: false,
      params: {
        orgId: type("string"),
        memberId: type("string"),
      },
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    const paramsSchema = schemas.params as Record<string, unknown>;
    const properties = paramsSchema.properties as Record<string, unknown>;
    expect(Object.keys(properties)).toHaveLength(2);
    const orgIdProperty = properties.orgId as Record<string, unknown>;
    const memberIdProperty = properties.memberId as Record<string, unknown>;
    expect(orgIdProperty.required).toBe(true);
    expect(memberIdProperty.required).toBe(true);
    expect(parsedDoc.parameters).toEqual(["orgId", "memberId"]);
  });

  test("generates route documentation with params having complex validation types", async () => {
    const config: RouteConfigType = {
      name: "api.posts.show",
      path: "/api/posts/:id",
      method: "GET",
      controller: MockController,
      description: "Get post by numeric ID",
      isSocket: false,
      params: {
        id: type("number"),
      },
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    const paramsSchema = schemas.params as Record<string, unknown>;
    expect(paramsSchema.type).toBe("object");
    const properties = paramsSchema.properties as Record<string, unknown>;
    const idProperty = properties.id as Record<string, unknown>;
    expect(idProperty.type).toBe("number");
  });

  test("generates route documentation with queries validation schema", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: MockController,
      description: "List users with query filters",
      isSocket: false,
      queries: type({
        page: "number",
        limit: "number",
        search: "string?",
      }),
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.queries).toBeDefined();
    const queriesSchema = schemas.queries as Record<string, unknown>;
    expect(queriesSchema.type).toBe("object");
    const properties = queriesSchema.properties as Record<string, unknown>;
    expect(properties.page).toBeDefined();
    expect((properties.page as Record<string, unknown>).required).toBe(true);
    expect(properties.limit).toBeDefined();
    expect((properties.limit as Record<string, unknown>).required).toBe(true);
    expect(properties.search).toBeDefined();
    expect((properties.search as Record<string, unknown>).required).toBe(false);
  });

  test("generates route documentation with both params and queries validation schemas", async () => {
    const config: RouteConfigType = {
      name: "api.organizations.search",
      path: "/api/organizations/:id",
      method: "GET",
      controller: UserController,
      description: "Search organization with filters",
      isSocket: false,
      params: {
        id: type("string"),
      },
      queries: type({
        status: "string",
        createdAfter: "string?",
        sort: "string?",
      }),
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    expect(schemas.queries).toBeDefined();
    const paramsSchema = schemas.params as Record<string, unknown>;
    const paramsProperties = paramsSchema.properties as Record<string, unknown>;
    const idProperty = paramsProperties.id as Record<string, unknown>;
    expect(idProperty.required).toBe(true);
    const queriesSchema = schemas.queries as Record<string, unknown>;
    const queriesProperties = queriesSchema.properties as Record<string, unknown>;
    expect(queriesProperties.status).toBeDefined();
    expect((queriesProperties.status as Record<string, unknown>).required).toBe(true);
    expect(queriesProperties.createdAfter).toBeDefined();
    expect((queriesProperties.createdAfter as Record<string, unknown>).required).toBe(false);
    expect(queriesProperties.sort).toBeDefined();
    expect((queriesProperties.sort as Record<string, unknown>).required).toBe(false);
    expect(parsedDoc.parameters).toEqual(["id"]);
  });

  test("generates route documentation with payload validation schema", async () => {
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
        age: "number?",
      }),
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.payload).toBeDefined();
    const payloadSchema = schemas.payload as Record<string, unknown>;
    expect(payloadSchema.type).toBe("object");
    const properties = payloadSchema.properties as Record<string, unknown>;
    expect(properties.name).toBeDefined();
    expect((properties.name as Record<string, unknown>).required).toBe(true);
    expect(properties.email).toBeDefined();
    expect((properties.email as Record<string, unknown>).required).toBe(true);
    expect(properties.age).toBeDefined();
    expect((properties.age as Record<string, unknown>).required).toBe(false);
  });

  test("generates route documentation with params, queries, and payload validation schemas", async () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/api/users/:id",
      method: "PUT",
      controller: UserController,
      description: "Update user with filters",
      isSocket: false,
      params: {
        id: type("string"),
      },
      queries: type({
        notify: "boolean?",
      }),
      payload: type({
        name: "string?",
        email: "string?",
        active: "boolean",
      }),
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    expect(schemas.queries).toBeDefined();
    expect(schemas.payload).toBeDefined();
    const paramsSchema = schemas.params as Record<string, unknown>;
    const paramsProperties = paramsSchema.properties as Record<string, unknown>;
    const idProperty = paramsProperties.id as Record<string, unknown>;
    expect(idProperty.required).toBe(true);
    const queriesSchema = schemas.queries as Record<string, unknown>;
    const queriesProperties = queriesSchema.properties as Record<string, unknown>;
    expect(queriesProperties.notify).toBeDefined();
    expect((queriesProperties.notify as Record<string, unknown>).required).toBe(false);
    const payloadSchema = schemas.payload as Record<string, unknown>;
    const payloadProperties = payloadSchema.properties as Record<string, unknown>;
    expect(payloadProperties.name).toBeDefined();
    expect((payloadProperties.name as Record<string, unknown>).required).toBe(false);
    expect(payloadProperties.email).toBeDefined();
    expect((payloadProperties.email as Record<string, unknown>).required).toBe(false);
    expect(payloadProperties.active).toBeDefined();
    expect((payloadProperties.active as Record<string, unknown>).required).toBe(true);
    expect(parsedDoc.parameters).toEqual(["id"]);
  });

  test("generates route documentation with response validation schema", async () => {
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
      response: type({
        id: "string",
        name: "string",
        email: "string",
        createdAt: "string",
      }),
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.response).toBeDefined();
    const responseSchema = schemas.response as Record<string, unknown>;
    expect(responseSchema.type).toBe("object");
    const properties = responseSchema.properties as Record<string, unknown>;
    expect(properties.id).toBeDefined();
    expect((properties.id as Record<string, unknown>).required).toBe(true);
    expect(properties.name).toBeDefined();
    expect((properties.name as Record<string, unknown>).required).toBe(true);
    expect(properties.email).toBeDefined();
    expect((properties.email as Record<string, unknown>).required).toBe(true);
    expect(properties.createdAt).toBeDefined();
    expect((properties.createdAt as Record<string, unknown>).required).toBe(true);
  });

  test("generates route documentation with payload and response validation schemas", async () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/api/users",
      method: "POST",
      controller: UserController,
      description: "Create user and return created data",
      isSocket: false,
      payload: type({
        name: "string",
        email: "string",
        age: "number?",
      }),
      response: type({
        id: "string",
        name: "string",
        email: "string",
        age: "number?",
        createdAt: "string",
        success: "boolean",
      }),
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.schemas).toBeDefined();
    const schemas = parsedDoc.schemas as Record<string, unknown>;
    expect(schemas.payload).toBeDefined();
    expect(schemas.response).toBeDefined();
    const payloadSchema = schemas.payload as Record<string, unknown>;
    const payloadProperties = payloadSchema.properties as Record<string, unknown>;
    expect(payloadProperties.name).toBeDefined();
    expect((payloadProperties.name as Record<string, unknown>).required).toBe(true);
    expect(payloadProperties.email).toBeDefined();
    expect((payloadProperties.email as Record<string, unknown>).required).toBe(true);
    expect(payloadProperties.age).toBeDefined();
    expect((payloadProperties.age as Record<string, unknown>).required).toBe(false);
    const responseSchema = schemas.response as Record<string, unknown>;
    const responseProperties = responseSchema.properties as Record<string, unknown>;
    expect(responseProperties.id).toBeDefined();
    expect((responseProperties.id as Record<string, unknown>).required).toBe(true);
    expect(responseProperties.name).toBeDefined();
    expect((responseProperties.name as Record<string, unknown>).required).toBe(true);
    expect(responseProperties.email).toBeDefined();
    expect((responseProperties.email as Record<string, unknown>).required).toBe(true);
    expect(responseProperties.age).toBeDefined();
    expect((responseProperties.age as Record<string, unknown>).required).toBe(false);
    expect(responseProperties.createdAt).toBeDefined();
    expect((responseProperties.createdAt as Record<string, unknown>).required).toBe(true);
    expect(responseProperties.success).toBeDefined();
    expect((responseProperties.success as Record<string, unknown>).required).toBe(true);
  });

  test("generates route documentation with env configuration", async () => {
    const config: RouteConfigType = {
      name: "api.admin.settings",
      path: "/api/admin/settings",
      method: "GET",
      controller: MockController,
      description: "Get admin settings (production only)",
      isSocket: false,
      env: [Environment.PRODUCTION, Environment.STAGING],
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.security).toBeDefined();
    const security = parsedDoc.security as Record<string, unknown>;
    expect(security.environments).toBeDefined();
    expect(security.environments).toEqual([Environment.PRODUCTION, Environment.STAGING]);
    expect(parsedDoc.name).toBe("api.admin.settings");
    expect(parsedDoc.description).toBe("Get admin settings (production only)");
  });

  test("generates route documentation with ip whitelist configuration", async () => {
    const config: RouteConfigType = {
      name: "api.internal.health",
      path: "/api/internal/health",
      method: "GET",
      controller: MockController,
      description: "Health check endpoint (restricted IPs)",
      isSocket: false,
      ip: ["127.0.0.1", "192.168.1.0/24"],
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.security).toBeDefined();
    const security = parsedDoc.security as Record<string, unknown>;
    expect(security.allowedIPs).toBeDefined();
    expect(security.allowedIPs).toEqual(["127.0.0.1", "192.168.1.0/24"]);
    expect(parsedDoc.name).toBe("api.internal.health");
    expect(parsedDoc.description).toBe("Health check endpoint (restricted IPs)");
  });

  test("generates route documentation with host configuration", async () => {
    const config: RouteConfigType = {
      name: "api.subdomain.list",
      path: "/api/data",
      method: "GET",
      controller: UserController,
      description: "Data endpoint for specific hosts",
      isSocket: false,
      host: ["api.example.com", "api.staging.example.com"],
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.security).toBeDefined();
    const security = parsedDoc.security as Record<string, unknown>;
    expect(security.allowedHosts).toBeDefined();
    expect(security.allowedHosts).toEqual(["api.example.com", "api.staging.example.com"]);
    expect(parsedDoc.name).toBe("api.subdomain.list");
    expect(parsedDoc.description).toBe("Data endpoint for specific hosts");
  });

  test("generates route documentation with roles configuration", async () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/api/users/:id",
      method: "DELETE",
      controller: UserController,
      description: "Delete user (admin only)",
      isSocket: false,
      params: {
        id: type("string"),
      },
      roles: [ERole.ADMIN, ERole.SUPER_ADMIN],
    };

    await generateRouteDoc(config);

    const fileName = `${config.name}.json`;
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const parsedDoc = await file.json();

    expect(parsedDoc.security).toBeDefined();
    const security = parsedDoc.security as Record<string, unknown>;
    expect(security.roles).toBeDefined();
    expect(security.roles).toEqual([ERole.ADMIN, ERole.SUPER_ADMIN]);
    expect(parsedDoc.name).toBe("api.users.delete");
    expect(parsedDoc.description).toBe("Delete user (admin only)");
    expect(parsedDoc.parameters).toEqual(["id"]);
  });

  afterAll(async () => {
    await Bun.spawn(["rm", "-rf", outputDir]).exited;
  });
});
