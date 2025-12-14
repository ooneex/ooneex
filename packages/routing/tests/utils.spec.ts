import { describe, expect, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import type { ContextType, IController } from "@ooneex/controller";
import type { IResponse } from "@ooneex/http-response";
import { ERole } from "@ooneex/role";
import { Assert } from "@ooneex/validation";
import type { RouteConfigType } from "@/types";
import {
  extractParameterNames,
  isValidRoutePath,
  routeConfigToFetcherString,
  routeConfigToJsonDoc,
  routeConfigToTypeString,
  routeConfigToUseQueryString,
} from "@/utils";

class MockController implements IController {
  public async index(context: ContextType): Promise<IResponse> {
    return context.response;
  }
}

class CustomUserController implements IController {
  public async index(context: ContextType): Promise<IResponse> {
    return context.response;
  }
}

describe("isValidRoutePath", () => {
  test("validates correct paths", () => {
    expect(isValidRoutePath("/users")).toBe(true);
    expect(isValidRoutePath("/users/:id")).toBe(true);
    expect(isValidRoutePath("/users/:id/posts/:postId")).toBe(true);
    expect(isValidRoutePath("/api/v1/users")).toBe(true);
  });

  test("rejects invalid paths", () => {
    expect(isValidRoutePath("users")).toBe(false);
    expect(isValidRoutePath("/users//posts")).toBe(false);
    expect(isValidRoutePath("/users/:")).toBe(false);
    expect(isValidRoutePath("/users/::id")).toBe(false);
    expect(isValidRoutePath("/:id:")).toBe(false);
  });
});

describe("extractParameterNames", () => {
  test("extracts single parameter", () => {
    expect(extractParameterNames("/users/:id")).toEqual(["id"]);
  });

  test("extracts multiple parameters", () => {
    expect(extractParameterNames("/users/:id/posts/:postId")).toEqual(["id", "postId"]);
  });

  test("returns empty array for paths without parameters", () => {
    expect(extractParameterNames("/users")).toEqual([]);
  });

  test("extracts parameters from complex paths", () => {
    expect(extractParameterNames("/users/:userId/emails/:emailId/state/:state")).toEqual([
      "userId",
      "emailId",
      "state",
    ]);
  });
});

describe("routeConfigToTypeString", () => {
  test("converts simple string params to type string", () => {
    const config = {
      params: {
        id: Assert("string"),
        emailId: Assert("string"),
      },
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("params: { id: string; emailId: string }");
  });

  test("converts object payload to type string", () => {
    const config = {
      payload: Assert({
        name: "string",
        age: "number",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("name: string");
    expect(result).toContain("age: number");
  });

  test("converts queries to type string", () => {
    const config = {
      queries: Assert({
        limit: "number",
        offset: "number",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("queries: { limit: number; offset: number }");
  });

  test("converts response to type string", () => {
    const config = {
      response: Assert({
        success: "boolean",
        message: "string",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("response:");
    expect(result).toContain("success: boolean");
    expect(result).toContain("message: string");
  });

  test("converts complete route config to type string", () => {
    const config = {
      params: {
        state: Assert("string"),
        id: Assert("string"),
        emailId: Assert("string"),
      },
      payload: Assert({
        name: "string",
      }),
      queries: Assert({
        limit: "number",
      }),
      response: Assert({
        success: "boolean",
        message: "string",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("response:");
    expect(result).toContain("success: boolean");
    expect(result).toContain("message: string");
    expect(result).toContain("params:");
    expect(result).toContain("state: string");
    expect(result).toContain("id: string");
    expect(result).toContain("emailId: string");
    expect(result).toContain("payload: { name: string }");
    expect(result).toContain("queries: { limit: number }");
  });

  test("handles optional properties", () => {
    const config = {
      payload: Assert({
        name: "string",
        "age?": "number",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("name: string");
    expect(result).toContain("age?: number");
  });

  test("handles array types", () => {
    const config = {
      payload: Assert({
        tags: "string[]",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("tags: string[]");
  });

  test("handles nested objects", () => {
    const config = {
      payload: Assert({
        user: {
          name: "string",
          email: "string",
        },
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("user:");
    expect(result).toContain("name: string");
    expect(result).toContain("email: string");
  });

  test("handles boolean types", () => {
    const config = {
      queries: Assert({
        active: "boolean",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("queries: { active: boolean }");
  });

  test("handles number types", () => {
    const config = {
      params: {
        count: Assert("number"),
      },
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("params: { count: number }");
  });

  test("handles empty config", () => {
    const config = {};

    const result = routeConfigToTypeString(config);

    expect(result).toBe("never");
  });

  test("returns properly formatted multi-line type string", () => {
    const config = {
      response: Assert({
        success: "boolean",
      }),
      params: {
        id: Assert("string"),
      },
    };

    const result = routeConfigToTypeString(config);

    expect(result).toMatch(/^\{\n/);
    expect(result).toMatch(/\n\}$/);
    expect(result).toContain(";\n  ");
  });
});

describe("routeConfigToJsonDoc", () => {
  test("converts minimal route config to JSON documentation", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List all users",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.name).toBe("api.users.list");
    expect(result.path).toBe("/users");
    expect(result.method).toBe("GET");
    expect(result.controller).toBe("MockController");
    expect(result.description).toBe("List all users");
    expect(result.isSocket).toBe(false);
    expect(result.parameters).toEqual([]);
    expect(result.schemas).toBeUndefined();
    expect(result.security).toBeUndefined();
  });

  test("includes controller name in JSON documentation", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/users",
      method: "POST",
      controller: MockController,
      description: "Create a new user",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.controller).toBe("MockController");
  });

  test("includes custom controller name in JSON documentation", () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/users/:id",
      method: "PUT",
      controller: CustomUserController,
      description: "Update user by ID",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.controller).toBe("CustomUserController");
    expect(result.name).toBe("api.users.update");
    expect(result.path).toBe("/users/:id");
  });

  test("extracts parameters from route path", () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user by ID",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.parameters).toEqual(["id"]);
  });

  test("extracts multiple parameters from route path", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:userId/emails/:emailId",
      method: "DELETE",
      controller: MockController,
      description: "Delete user email",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.parameters).toEqual(["userId", "emailId"]);
  });

  test("converts params to JSON schema", () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user by ID",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeDefined();
    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    const paramsSchema = schemas.params as Record<string, unknown>;
    expect(paramsSchema.type).toBe("object");
    expect(paramsSchema.properties).toBeDefined();
    const properties = paramsSchema.properties as Record<string, unknown>;
    const idProperty = properties.id as Record<string, unknown>;
    expect(idProperty.required).toBe(true);
  });

  test("converts multiple params to JSON schema", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:userId/emails/:emailId",
      method: "DELETE",
      controller: MockController,
      description: "Delete user email",
      isSocket: false,
      params: {
        userId: Assert("string"),
        emailId: Assert("string"),
      },
    };

    const result = routeConfigToJsonDoc(config);

    const schemas = result.schemas as Record<string, unknown>;
    const paramsSchema = schemas.params as Record<string, unknown>;
    const properties = paramsSchema.properties as Record<string, unknown>;
    expect(Object.keys(properties)).toHaveLength(2);
    const userIdProperty = properties.userId as Record<string, unknown>;
    const emailIdProperty = properties.emailId as Record<string, unknown>;
    expect(userIdProperty.required).toBe(true);
    expect(emailIdProperty.required).toBe(true);
  });

  test("converts queries to JSON schema", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List users",
      isSocket: false,
      queries: Assert({
        limit: "number",
        offset: "number",
      }),
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeDefined();
    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.queries).toBeDefined();
    const queriesSchema = schemas.queries as Record<string, unknown>;
    expect(queriesSchema.$schema).toBeUndefined();
    expect(queriesSchema.required).toBeUndefined();
    const queriesProperties = queriesSchema.properties as Record<string, unknown>;
    expect(queriesProperties.limit).toBeDefined();
    expect((queriesProperties.limit as Record<string, unknown>).required).toBe(true);
    expect(queriesProperties.offset).toBeDefined();
    expect((queriesProperties.offset as Record<string, unknown>).required).toBe(true);
  });

  test("converts payload to JSON schema", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/users",
      method: "POST",
      controller: MockController,
      description: "Create user",
      isSocket: false,
      payload: Assert({
        name: "string",
        email: "string",
      }),
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeDefined();
    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.payload).toBeDefined();
    const payloadSchema = schemas.payload as Record<string, unknown>;
    expect(payloadSchema.$schema).toBeUndefined();
    expect(payloadSchema.required).toBeUndefined();
    const payloadProperties = payloadSchema.properties as Record<string, unknown>;
    expect(payloadProperties.name).toBeDefined();
    expect((payloadProperties.name as Record<string, unknown>).required).toBe(true);
    expect(payloadProperties.email).toBeDefined();
    expect((payloadProperties.email as Record<string, unknown>).required).toBe(true);
  });

  test("converts response to JSON schema", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/users",
      method: "POST",
      controller: MockController,
      description: "Create user",
      isSocket: false,
      response: Assert({
        success: "boolean",
        message: "string",
      }),
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeDefined();
    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.response).toBeDefined();
    const responseSchema = schemas.response as Record<string, unknown>;
    expect(responseSchema.$schema).toBeUndefined();
    expect(responseSchema.required).toBeUndefined();
    const responseProperties = responseSchema.properties as Record<string, unknown>;
    expect(responseProperties.success).toBeDefined();
    expect((responseProperties.success as Record<string, unknown>).required).toBe(true);
    expect(responseProperties.message).toBeDefined();
    expect((responseProperties.message as Record<string, unknown>).required).toBe(true);
  });

  test("converts complete route config with all schemas", () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/users/:id",
      method: "PUT",
      controller: MockController,
      description: "Update user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      queries: Assert({
        validate: "boolean",
      }),
      payload: Assert({
        name: "string",
        email: "string",
      }),
      response: Assert({
        success: "boolean",
        data: {
          id: "string",
          name: "string",
        },
      }),
    };

    const result = routeConfigToJsonDoc(config);

    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    expect(schemas.queries).toBeDefined();
    expect(schemas.payload).toBeDefined();
    expect(schemas.response).toBeDefined();

    const queriesSchema = schemas.queries as Record<string, unknown>;
    expect(queriesSchema.$schema).toBeUndefined();
    expect(queriesSchema.required).toBeUndefined();
    const queriesProperties = queriesSchema.properties as Record<string, unknown>;
    expect((queriesProperties.validate as Record<string, unknown>).required).toBe(true);

    const payloadSchema = schemas.payload as Record<string, unknown>;
    expect(payloadSchema.$schema).toBeUndefined();
    expect(payloadSchema.required).toBeUndefined();
    const payloadProperties = payloadSchema.properties as Record<string, unknown>;
    expect((payloadProperties.name as Record<string, unknown>).required).toBe(true);
    expect((payloadProperties.email as Record<string, unknown>).required).toBe(true);

    const responseSchema = schemas.response as Record<string, unknown>;
    expect(responseSchema.$schema).toBeUndefined();
    expect(responseSchema.required).toBeUndefined();
    const responseProperties = responseSchema.properties as Record<string, unknown>;
    expect((responseProperties.success as Record<string, unknown>).required).toBe(true);
  });

  test("does not include security object when no security config provided", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List users",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeUndefined();
  });

  test("includes environments in security when provided", () => {
    const config: RouteConfigType = {
      name: "api.debug.info",
      path: "/debug",
      method: "GET",
      controller: MockController,
      description: "Debug info",
      isSocket: false,
      env: [Environment.LOCAL, Environment.DEVELOPMENT],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeDefined();
    const security = result.security as Record<string, unknown>;
    expect(security.environments).toEqual([Environment.LOCAL, Environment.DEVELOPMENT]);
    expect(security.roles).toBeUndefined();
    expect(security.allowedIPs).toBeUndefined();
    expect(security.allowedHosts).toBeUndefined();
  });

  test("includes roles in security when provided", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/admin/users",
      method: "GET",
      controller: MockController,
      description: "Admin users",
      isSocket: false,
      roles: [ERole.ADMIN, ERole.SUPER_ADMIN],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeDefined();
    const security = result.security as Record<string, unknown>;
    expect(security.roles).toEqual([ERole.ADMIN, ERole.SUPER_ADMIN]);
    expect(security.environments).toBeUndefined();
    expect(security.allowedIPs).toBeUndefined();
    expect(security.allowedHosts).toBeUndefined();
  });

  test("includes allowedIPs in security when provided", () => {
    const config: RouteConfigType = {
      name: "api.internal.stats",
      path: "/internal/stats",
      method: "GET",
      controller: MockController,
      description: "Internal stats",
      isSocket: false,
      ip: ["127.0.0.1", "192.168.1.1"],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeDefined();
    const security = result.security as Record<string, unknown>;
    expect(security.allowedIPs).toEqual(["127.0.0.1", "192.168.1.1"]);
    expect(security.environments).toBeUndefined();
    expect(security.roles).toBeUndefined();
    expect(security.allowedHosts).toBeUndefined();
  });

  test("includes allowedHosts in security when provided", () => {
    const config: RouteConfigType = {
      name: "api.webhook.receive",
      path: "/webhook",
      method: "POST",
      controller: MockController,
      description: "Webhook endpoint",
      isSocket: false,
      host: ["example.com", "api.example.com"],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeDefined();
    const security = result.security as Record<string, unknown>;
    expect(security.allowedHosts).toEqual(["example.com", "api.example.com"]);
    expect(security.environments).toBeUndefined();
    expect(security.roles).toBeUndefined();
    expect(security.allowedIPs).toBeUndefined();
  });

  test("includes all security properties when all provided", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/secure",
      method: "POST",
      controller: MockController,
      description: "Secure endpoint",
      isSocket: false,
      env: [Environment.PRODUCTION],
      roles: [ERole.ADMIN],
      ip: ["10.0.0.1"],
      host: ["secure.example.com"],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeDefined();
    const security = result.security as Record<string, unknown>;
    expect(security.environments).toEqual([Environment.PRODUCTION]);
    expect(security.roles).toEqual([ERole.ADMIN]);
    expect(security.allowedIPs).toEqual(["10.0.0.1"]);
    expect(security.allowedHosts).toEqual(["secure.example.com"]);
  });

  test("does not include empty arrays in security", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List users",
      isSocket: false,
      env: [],
      roles: [],
      ip: [],
      host: [],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.security).toBeUndefined();
  });

  test("handles socket routes", () => {
    const config: RouteConfigType = {
      name: "api.chat.connect",
      path: "/chat/:roomId",
      method: "GET",
      controller: MockController,
      description: "Chat socket",
      isSocket: true,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.isSocket).toBe(true);
    expect(result.parameters).toEqual(["roomId"]);
  });

  test("handles complex nested payload schemas", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/users",
      method: "POST",
      controller: MockController,
      description: "Create user",
      isSocket: false,
      payload: Assert({
        name: "string",
        address: {
          street: "string",
          city: "string",
        },
        tags: "string[]",
      }),
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeDefined();
    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.payload).toBeDefined();
  });

  test("handles optional properties in schemas", () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/users/:id",
      method: "PATCH",
      controller: MockController,
      description: "Update user",
      isSocket: false,
      payload: Assert({
        name: "string",
        "age?": "number",
      }),
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeDefined();
    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.payload).toBeDefined();
  });

  test("does not include schemas property when no schemas defined", () => {
    const config: RouteConfigType = {
      name: "api.health.check",
      path: "/health",
      method: "GET",
      controller: MockController,
      description: "Health check",
      isSocket: false,
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.schemas).toBeUndefined();
  });

  test("handles route with only params schema", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:id",
      method: "DELETE",
      controller: MockController,
      description: "Delete user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
    };

    const result = routeConfigToJsonDoc(config);

    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    expect(schemas.queries).toBeUndefined();
    expect(schemas.payload).toBeUndefined();
    expect(schemas.response).toBeUndefined();
  });

  test("generates complete JSON documentation for complex route", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:id/emails/:emailId/state/:state",
      method: "DELETE",
      controller: MockController,
      description: "Delete a user by ID",
      isSocket: false,
      params: {
        state: Assert("string"),
        id: Assert("string"),
        emailId: Assert("string"),
      },
      payload: Assert({
        name: "string",
      }),
      queries: Assert({
        limit: "number",
      }),
      response: Assert({
        success: "boolean",
        message: "string",
      }),
      env: [Environment.LOCAL],
      roles: [ERole.ADMIN],
    };

    const result = routeConfigToJsonDoc(config);

    expect(result.name).toBe("api.users.delete");
    expect(result.path).toBe("/users/:id/emails/:emailId/state/:state");
    expect(result.method).toBe("DELETE");
    expect(result.controller).toBe("MockController");
    expect(result.description).toBe("Delete a user by ID");
    expect(result.isSocket).toBe(false);
    expect(result.parameters).toEqual(["id", "emailId", "state"]);
    expect(result.schemas).toBeDefined();
    expect(result.security).toBeDefined();

    const schemas = result.schemas as Record<string, unknown>;
    expect(schemas.params).toBeDefined();
    expect(schemas.queries).toBeDefined();
    expect(schemas.payload).toBeDefined();
    expect(schemas.response).toBeDefined();

    const security = result.security as Record<string, unknown>;
    expect(security.environments).toEqual([Environment.LOCAL]);
    expect(security.roles).toEqual([ERole.ADMIN]);
  });
});

describe("routeConfigToFetcherString", () => {
  test("generates basic fetcher class with DELETE method and params only", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:id",
      method: "DELETE",
      controller: MockController,
      description: "Delete a user by ID",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain('import type { ResponseDataType } from "@ooneex/http-response"');
    expect(result).toContain('import { Fetcher } from "@ooneex/fetcher"');
    expect(result).toContain("export type DeleteRouteConfigType");
    expect(result).toContain("export class ApiUsersDeleteFetcher");
    expect(result).toContain("constructor(private baseURL: string)");
    expect(result).toContain("public async delete(");
    expect(result).toContain('params: DeleteRouteConfigType["params"]');
    expect(result).toContain('Promise<ResponseDataType<DeleteRouteConfigType["response"]>>');
    expect(result).toContain("const fetcher = new Fetcher(this.baseURL)");
    expect(result).toContain("return await fetcher.delete");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: trust me
    expect(result).toContain("/users/${config.params.id}");
  });

  test("generates fetcher class with multiple params", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:id/emails/:emailId/state/:state",
      method: "DELETE",
      controller: MockController,
      description: "Delete a user email by ID",
      isSocket: false,
      params: {
        state: Assert("string"),
        id: Assert("string"),
        emailId: Assert("string"),
      },
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export class ApiUsersDeleteFetcher");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: trust me
    expect(result).toContain("/users/${config.params.id}/emails/${config.params.emailId}/state/${config.params.state}");
    expect(result).toContain('params: DeleteRouteConfigType["params"]');
  });

  test("generates fetcher class with POST method and payload", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/users",
      method: "POST",
      controller: MockController,
      description: "Create a new user",
      isSocket: false,
      payload: Assert({
        name: "string",
        email: "string",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export type CreateRouteConfigType");
    expect(result).toContain("export class ApiUsersCreateFetcher");
    expect(result).toContain("public async create(");
    expect(result).toContain('payload: CreateRouteConfigType["payload"]');
    expect(result).toContain("return await fetcher.post");
    expect(result).toContain("config.payload");
  });

  test("generates fetcher class with PUT method, params and payload", () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/users/:id",
      method: "PUT",
      controller: MockController,
      description: "Update a user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      payload: Assert({
        name: "string",
        email: "string",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export type UpdateRouteConfigType");
    expect(result).toContain("export class ApiUsersUpdateFetcher");
    expect(result).toContain("public async update(");
    expect(result).toContain('params: UpdateRouteConfigType["params"]');
    expect(result).toContain('payload: UpdateRouteConfigType["payload"]');
    expect(result).toContain("return await fetcher.put");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: trust me
    expect(result).toContain("/users/${config.params.id}");
    expect(result).toContain("config.payload");
  });

  test("generates fetcher class with PATCH method", () => {
    const config: RouteConfigType = {
      name: "api.users.edit",
      path: "/users/:id",
      method: "PATCH",
      controller: MockController,
      description: "Partially update a user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      payload: Assert({
        name: "string?",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export type EditRouteConfigType");
    expect(result).toContain("export class ApiUsersEditFetcher");
    expect(result).toContain("public async edit(");
    expect(result).toContain("return await fetcher.patch");
    expect(result).toContain("config.payload");
  });

  test("generates fetcher class with GET method and queries", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List users",
      isSocket: false,
      queries: Assert({
        limit: "number",
        offset: "number",
      }),
      response: Assert({
        users: "unknown[]",
        total: "number",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export type ListRouteConfigType");
    expect(result).toContain("export class ApiUsersListFetcher");
    expect(result).toContain("public async list(");
    expect(result).toContain('queries: ListRouteConfigType["queries"]');
    expect(result).toContain("return await fetcher.get");
    expect(result).toContain("new URLSearchParams(config.queries as Record<string, string>).toString()");
  });

  test("generates fetcher class with complete config (params, payload, queries, response)", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:id/emails/:emailId/state/:state",
      method: "DELETE",
      controller: MockController,
      description: "Delete a user by ID",
      isSocket: false,
      params: {
        state: Assert("string"),
        id: Assert("string"),
        emailId: Assert("string"),
      },
      payload: Assert({
        name: "string",
      }),
      queries: Assert({
        limit: "number",
      }),
      response: Assert({
        success: "boolean",
        message: "string",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export type DeleteRouteConfigType");
    expect(result).toContain("response:");
    expect(result).toContain("success: boolean");
    expect(result).toContain("message: string");
    expect(result).toContain("params:");
    expect(result).toContain("state: string");
    expect(result).toContain("id: string");
    expect(result).toContain("emailId: string");
    expect(result).toContain("payload: { name: string }");
    expect(result).toContain("queries: { limit: number }");
    expect(result).toContain("export class ApiUsersDeleteFetcher");
    expect(result).toContain('params: DeleteRouteConfigType["params"]');
    expect(result).toContain('payload: DeleteRouteConfigType["payload"]');
    expect(result).toContain('queries: DeleteRouteConfigType["queries"]');
    expect(result).toContain('Promise<ResponseDataType<DeleteRouteConfigType["response"]>>');
  });

  test("generates fetcher class with HEAD method", () => {
    const config: RouteConfigType = {
      name: "api.users.check",
      path: "/users/:id",
      method: "HEAD",
      controller: MockController,
      description: "Check if user exists",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export class ApiUsersCheckFetcher");
    expect(result).toContain("public async check(");
    expect(result).toContain("return await fetcher.head");
  });

  test("generates fetcher class with OPTIONS method", () => {
    const config: RouteConfigType = {
      name: "api.users.info",
      path: "/users",
      method: "OPTIONS",
      controller: MockController,
      description: "Get available options",
      isSocket: false,
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export class ApiUsersInfoFetcher");
    expect(result).toContain("public async info(");
    expect(result).toContain("return await fetcher.options");
  });

  test("generates correct class name for nested route names", () => {
    const config: RouteConfigType = {
      name: "admin.settings.update",
      path: "/admin/settings",
      method: "PUT",
      controller: MockController,
      description: "Update admin settings",
      isSocket: false,
      payload: Assert({
        key: "string",
        value: "string",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export class AdminSettingsUpdateFetcher");
    expect(result).toContain("export type UpdateRouteConfigType");
  });

  test("generates fetcher without config parameter when no params, payload, or queries", () => {
    const config: RouteConfigType = {
      name: "api.health.check",
      path: "/health",
      method: "GET",
      controller: MockController,
      description: "Health check endpoint",
      isSocket: false,
      response: Assert({
        status: "string",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export class ApiHealthCheckFetcher");
    expect(result).toContain("public async check()");
    expect(result).not.toContain("config:");
  });

  test("handles complex nested response types", () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user details",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      response: Assert({
        user: {
          id: "string",
          name: "string",
          email: "string",
          address: {
            street: "string",
            city: "string",
          },
        },
        success: "boolean",
      }),
    };

    const result = routeConfigToFetcherString(config);

    expect(result).toContain("export type ShowRouteConfigType");
    expect(result).toContain("export class ApiUsersShowFetcher");
    expect(result).toContain("public async show(");
    expect(result).toContain("response:");
    expect(result).toContain("user:");
    expect(result).toContain("id: string");
    expect(result).toContain("name: string");
    expect(result).toContain("email: string");
    expect(result).toContain("address:");
    expect(result).toContain("street: string");
    expect(result).toContain("city: string");
    expect(result).toContain("success: boolean");
  });

  test("includes both imports in generated output", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List users",
      isSocket: false,
    };

    const result = routeConfigToFetcherString(config);

    const lines = result.split("\n");
    expect(lines[0]).toBe('import type { ResponseDataType } from "@ooneex/http-response";');
    expect(lines[1]).toBe('import { Fetcher } from "@ooneex/fetcher";');
  });
});

describe("routeConfigToUseQueryString", () => {
  test("generates useQuery hook for GET request with params", () => {
    const config: RouteConfigType = {
      name: "api.users.retrieve",
      path: "/users/:id",
      method: "GET",
      controller: MockController,
      description: "Get user by ID",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      response: Assert({
        name: "string",
        email: "string",
      }),
    };

    const result = routeConfigToUseQueryString(config, "https://api.example.com");

    expect(result).toContain("import { useQuery } from '@tanstack/react-query';");
    expect(result).toContain("import { Fetcher } from '@ooneex/fetcher';");
    expect(result).toContain("export type RetrieveRouteConfigType");
    expect(result).toContain("export const useApiUsersRetrieve = (config: {");
    expect(result).toContain('params: RetrieveRouteConfigType["params"]');
    expect(result).toContain("return useQuery({");
    expect(result).toContain("queryKey: ['api', 'users', 'retrieve', config.params.id]");
    expect(result).toContain("queryFn: async () => {");
    expect(result).toContain("new Fetcher('https://api.example.com')");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: trust me
    expect(result).toContain("/users/${config.params.id}");
  });

  test("generates useQuery hook for GET request with queries", () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/users",
      method: "GET",
      controller: MockController,
      description: "List users",
      isSocket: false,
      queries: Assert({
        limit: "number",
        offset: "number",
      }),
      response: Assert({
        users: "unknown[]",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("import { Fetcher } from '@ooneex/fetcher';");
    expect(result).toContain('queries?: ListRouteConfigType["queries"]');
    expect(result).toContain("queryKey: ['api', 'users', 'list', config.queries]");
    expect(result).toContain("new URLSearchParams(config.queries as Record<string, string>).toString()");
  });

  test("generates useMutation hook for POST request", () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/users",
      method: "POST",
      controller: MockController,
      description: "Create user",
      isSocket: false,
      payload: Assert({
        name: "string",
        email: "string",
      }),
      response: Assert({
        id: "string",
        name: "string",
        email: "string",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("import { useMutation } from '@tanstack/react-query';");
    expect(result).toContain("import { Fetcher } from '@ooneex/fetcher';");
    expect(result).toContain("export const useApiUsersCreate = () => {");
    expect(result).toContain("const mutation = useMutation({");
    expect(result).toContain("mutationFn: async (config: {");
    expect(result).toContain('payload: CreateRouteConfigType["payload"]');
    expect(result).toContain("fetcher.post");
    expect(result).toContain("config.payload");
    expect(result).toContain("return mutation;");
  });

  test("generates useMutation hook for DELETE request with params", () => {
    const config: RouteConfigType = {
      name: "api.users.delete",
      path: "/users/:id",
      method: "DELETE",
      controller: MockController,
      description: "Delete user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      response: Assert({
        success: "boolean",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("import { useMutation } from '@tanstack/react-query';");
    expect(result).toContain("import { Fetcher } from '@ooneex/fetcher';");
    expect(result).toContain("export const useApiUsersDelete = () => {");
    expect(result).toContain("mutationFn: async (config: {");
    expect(result).toContain('params: DeleteRouteConfigType["params"]');
    expect(result).toContain("fetcher.delete");
  });

  test("generates useMutation hook for PUT request with payload", () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/users/:id",
      method: "PUT",
      controller: MockController,
      description: "Update user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      payload: Assert({
        name: "string",
        email: "string",
      }),
      response: Assert({
        id: "string",
        name: "string",
        email: "string",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("fetcher.put");
    expect(result).toContain('payload: UpdateRouteConfigType["payload"]');
    expect(result).toContain("config.payload");
  });

  test("generates useMutation hook for PATCH request", () => {
    const config: RouteConfigType = {
      name: "api.users.update",
      path: "/users/:id",
      method: "PATCH",
      controller: MockController,
      description: "Patch user",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
      payload: Assert({
        name: "string",
      }),
      response: Assert({
        id: "string",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("fetcher.patch");
    expect(result).toContain("config.payload");
  });

  test("handles route with no params, payload, or queries", () => {
    const config: RouteConfigType = {
      name: "api.health.check",
      path: "/health",
      method: "GET",
      controller: MockController,
      description: "Health check",
      isSocket: false,
      response: Assert({
        status: "string",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("export const useApiHealthCheck = () => {");
    expect(result).toContain("queryKey: ['api', 'health', 'check']");
  });

  test("generates correct type definitions", () => {
    const config: RouteConfigType = {
      name: "api.posts.create",
      path: "/posts",
      method: "POST",
      controller: MockController,
      description: "Create post",
      isSocket: false,
      payload: Assert({
        title: "string",
        content: "string",
      }),
      response: Assert({
        id: "string",
        title: "string",
      }),
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("export type CreateRouteConfigType = {");
    expect(result).toContain("response:");
    expect(result).toContain("payload:");
  });

  test("handles HEAD request as query", () => {
    const config: RouteConfigType = {
      name: "api.resource.check",
      path: "/resource/:id",
      method: "HEAD",
      controller: MockController,
      description: "Check resource",
      isSocket: false,
      params: {
        id: Assert("string"),
      },
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("import { useQuery } from '@tanstack/react-query';");
    expect(result).toContain("fetcher.head");
  });

  test("handles OPTIONS request as query", () => {
    const config: RouteConfigType = {
      name: "api.resource.list",
      path: "/resource",
      method: "OPTIONS",
      controller: MockController,
      description: "Resource options",
      isSocket: false,
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("import { useQuery } from '@tanstack/react-query';");
    expect(result).toContain("fetcher.options");
  });

  test("uses baseURL parameter correctly", () => {
    const config: RouteConfigType = {
      name: "api.test.run",
      path: "/test",
      method: "GET",
      controller: MockController,
      description: "Test",
      isSocket: false,
    };

    const resultWithBase = routeConfigToUseQueryString(config, "https://example.com");
    const resultWithoutBase = routeConfigToUseQueryString(config);

    expect(resultWithBase).toContain("new Fetcher('https://example.com')");
    expect(resultWithoutBase).toContain("new Fetcher('')");
  });

  test("includes error handling in fetch", () => {
    const config: RouteConfigType = {
      name: "api.test.execute",
      path: "/test",
      method: "GET",
      controller: MockController,
      description: "Test",
      isSocket: false,
    };

    const result = routeConfigToUseQueryString(config);

    expect(result).toContain("new Fetcher");
    expect(result).toContain("fetcher.get");
  });
});
