import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { IController } from "@ooneex/controller";
import { HttpResponse } from "@ooneex/http-response";
import type { RouteConfigType } from "@ooneex/routing";
import { type } from "arktype";
import { generateRouteSocket } from "../src/generateRouteSocket";

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

describe("generateRouteSocket", () => {
  const outputDir = join(process.cwd(), "src/fetchers");

  test("generates socket file with minimal config", async () => {
    const config: RouteConfigType = {
      name: "api.users.list",
      path: "/api/users",
      method: "GET",
      controller: UserController,
      description: "List all users",
      isSocket: true,
    };

    await generateRouteSocket(config);

    const fileName = "ApiUsersListSocket.ts";
    const filePath = join(outputDir, fileName);

    // Verify file was created
    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    // Read the generated file
    const content = await file.text();

    // Verify imports are present
    expect(content).toContain('import type { ResponseDataType } from "@ooneex/http-response"');
    expect(content).toContain('import type { LocaleInfoType } from "@ooneex/translation"');
    expect(content).toContain('import { type ISocket, Socket } from "@ooneex/socket/client"');

    // Verify type definition is present
    expect(content).toContain("export type ListRouteConfigType");

    // Verify class definition is present
    expect(content).toContain("export class ApiUsersListSocket");
    expect(content).toContain("constructor(private baseURL: string)");
    expect(content).toContain("public list(");

    // Verify Socket is instantiated
    expect(content).toContain("new Socket<");

    // Verify event handlers are present with types
    expect(content).toContain("socket.onMessage((response: ResponseDataType<never>) => {");
    expect(content).toContain("socket.onOpen((event: Event) => {");
    expect(content).toContain("socket.onClose((event: CloseEvent) => {");
    expect(content).toContain("socket.onError((event: Event, response?: ResponseDataType<never>) => {");

    // Verify return type
    expect(content).toContain("): ISocket<");
  });

  test("generates socket file with parameters", async () => {
    const config: RouteConfigType = {
      name: "api.users.get",
      path: "/api/users/:id",
      method: "GET",
      controller: UserController,
      description: "Get user by ID",
      isSocket: true,
      params: {
        id: type("string"),
      },
    };

    await generateRouteSocket(config);

    const fileName = "ApiUsersGetSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition includes params
    expect(content).toContain("export type GetRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiUsersGetSocket");
    expect(content).toContain("public get(");

    // Verify params are in method signature
    expect(content).toContain('params: GetRouteConfigType["params"]');

    // Verify URL construction with params
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${this.baseURL}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.id}");
  });

  test("generates socket file with payload", async () => {
    const config: RouteConfigType = {
      name: "api.users.create",
      path: "/api/users",
      method: "POST",
      controller: UserController,
      description: "Create a new user",
      isSocket: true,
      payload: type({
        name: "string",
        email: "string",
        age: "number",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiUsersCreateSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition includes payload
    expect(content).toContain("export type CreateRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiUsersCreateSocket");
    expect(content).toContain("public create(");

    // Verify SendData type includes payload
    expect(content).toContain('payload: CreateRouteConfigType["payload"]');

    // Verify language field is included in SendData type
    expect(content).toContain("language?: LocaleInfoType");
  });

  test("generates socket file with params and payload", async () => {
    const config: RouteConfigType = {
      name: "api.profiles.update",
      path: "/api/profiles/:id",
      method: "PUT",
      controller: UserController,
      description: "Update profile",
      isSocket: true,
      params: {
        id: type("string"),
      },
      payload: type({
        name: "string",
        email: "string",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiProfilesUpdateSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify type definition
    expect(content).toContain("export type UpdateRouteConfigType");

    // Verify class and method
    expect(content).toContain("export class ApiProfilesUpdateSocket");
    expect(content).toContain("public update(");

    // Verify params are in method signature
    expect(content).toContain('params: UpdateRouteConfigType["params"]');

    // Verify SendData type includes payload
    expect(content).toContain('payload: UpdateRouteConfigType["payload"]');

    // Verify URL with params
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.id}");
  });

  test("generates socket file with query parameters", async () => {
    const config: RouteConfigType = {
      name: "api.users.search",
      path: "/api/users/search",
      method: "GET",
      controller: UserController,
      description: "Search users",
      isSocket: true,
      queries: type({
        page: "number?",
        limit: "number?",
        search: "string?",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiUsersSearchSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify queries are in SendData type
    expect(content).toContain('queries: SearchRouteConfigType["queries"]');

    // Verify language field is included
    expect(content).toContain("language?: LocaleInfoType");
  });

  test("generates socket file with params, queries, and payload", async () => {
    const config: RouteConfigType = {
      name: "api.memberships.update",
      path: "/api/orgs/:orgId/members/:memberId",
      method: "PUT",
      controller: UserController,
      description: "Update organization member",
      isSocket: true,
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

    await generateRouteSocket(config);

    const fileName = "ApiMembershipsUpdateSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify params are in method signature
    expect(content).toContain('params: UpdateRouteConfigType["params"]');

    // Verify SendData type includes all parts
    expect(content).toContain('payload: UpdateRouteConfigType["payload"]');
    expect(content).toContain('queries: UpdateRouteConfigType["queries"]');
    expect(content).toContain("language?: LocaleInfoType");

    // Verify URL construction with multiple params
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.orgId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.memberId}");
  });

  test("generates socket file with multiple path parameters", async () => {
    const config: RouteConfigType = {
      name: "api.orgs.projects.tasks.get",
      path: "/api/orgs/:orgId/projects/:projectId/tasks/:taskId",
      method: "GET",
      controller: UserController,
      description: "Get task details",
      isSocket: true,
      params: {
        orgId: type("string"),
        projectId: type("string"),
        taskId: type("string"),
      },
    };

    await generateRouteSocket(config);

    const fileName = "ApiOrgsProjectsTasksGetSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify all params are referenced in URL
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.orgId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.projectId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.taskId}");
  });

  test("generates socket file with response type", async () => {
    const config: RouteConfigType = {
      name: "api.users.show",
      path: "/api/users/:id",
      method: "GET",
      controller: UserController,
      description: "Get user with response type",
      isSocket: true,
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

    await generateRouteSocket(config);

    const fileName = "ApiUsersShowSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify response type is used in Socket generic
    expect(content).toContain('ShowRouteConfigType["response"]');
  });

  test("generates socket file without response type uses never", async () => {
    const config: RouteConfigType = {
      name: "api.events.create",
      path: "/api/events",
      method: "POST",
      controller: UserController,
      description: "Broadcast event without response",
      isSocket: true,
      payload: type({
        event: "string",
        data: "unknown",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiEventsCreateSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify response type is used in Socket generic
    expect(content).toContain('CreateRouteConfigType["payload"]');
    expect(content).toContain("language?: LocaleInfoType");
  });

  test("overwrites existing socket file with same route name", async () => {
    const config: RouteConfigType = {
      name: "api.users.index",
      path: "/api/test",
      method: "GET",
      controller: MockController,
      description: "Test overwrite",
      isSocket: true,
    };

    // Generate first time
    await generateRouteSocket(config);

    const fileName = "ApiUsersIndexSocket.ts";
    const filePath = join(outputDir, fileName);
    const file = Bun.file(filePath);
    const firstContent = await file.text();

    // Generate second time
    await generateRouteSocket(config);

    const updatedFile = Bun.file(filePath);
    const secondContent = await updatedFile.text();

    // Both should exist and be identical
    expect(await file.exists()).toBe(true);
    expect(await updatedFile.exists()).toBe(true);
    expect(firstContent).toBe(secondContent);
  });

  test("generates socket with proper class naming from route name", async () => {
    const config: RouteConfigType = {
      name: "api.v2.users.list",
      path: "/api/v2/users",
      method: "GET",
      controller: UserController,
      description: "List users v2",
      isSocket: true,
    };

    await generateRouteSocket(config);

    const fileName = "ApiV2UsersListSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify class name follows PascalCase naming convention
    expect(content).toContain("export class ApiV2UsersListSocket");
  });

  test("generates socket for root path", async () => {
    const config: RouteConfigType = {
      name: "api.users.index",
      path: "/",
      method: "GET",
      controller: MockController,
      description: "Root endpoint",
      isSocket: true,
    };

    await generateRouteSocket(config);

    const fileName = "ApiUsersIndexSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify class is generated correctly
    expect(content).toContain("export class ApiUsersIndexSocket");
    expect(content).toContain("public index(");
  });

  test("generates socket with all event handlers", async () => {
    const config: RouteConfigType = {
      name: "api.chat.list",
      path: "/api/chat/:roomId",
      method: "GET",
      controller: UserController,
      description: "Chat messages socket",
      isSocket: true,
      params: {
        roomId: type("string"),
      },
      payload: type({
        message: "string",
      }),
      response: type({
        id: "string",
        message: "string",
        timestamp: "number",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiChatListSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify all event handlers exist with correct typed signatures
    expect(content).toContain('socket.onMessage((response: ResponseDataType<ListRouteConfigType["response"]>) => {');
    expect(content).toContain("// TODO: Handle socket message event");

    expect(content).toContain("socket.onOpen((event: Event) => {");
    expect(content).toContain("// TODO: Handle socket open event");

    expect(content).toContain("socket.onClose((event: CloseEvent) => {");
    expect(content).toContain("// TODO: Handle socket close event");

    expect(content).toContain(
      'socket.onError((event: Event, response?: ResponseDataType<ListRouteConfigType["response"]>) => {',
    );
    expect(content).toContain("// TODO: Handle socket error event");

    // Verify socket is returned
    expect(content).toContain("return socket;");
  });

  test("generates socket without params has empty method signature", async () => {
    const config: RouteConfigType = {
      name: "api.notifications.list",
      path: "/api/notifications",
      method: "GET",
      controller: UserController,
      description: "Stream notifications",
      isSocket: true,
      response: type({
        id: "string",
        message: "string",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiNotificationsListSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify method has no parameters
    expect(content).toContain("public list(): ISocket");
  });

  test("generates socket with only queries in SendData type", async () => {
    const config: RouteConfigType = {
      name: "api.feed.list",
      path: "/api/feed",
      method: "GET",
      controller: UserController,
      description: "Live feed",
      isSocket: true,
      queries: type({
        category: "string?",
        limit: "number?",
      }),
    };

    await generateRouteSocket(config);

    const fileName = "ApiFeedListSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify SendData type includes queries and language
    expect(content).toContain('queries: ListRouteConfigType["queries"]');
    expect(content).toContain("language?: LocaleInfoType");

    // Verify payload is not included
    expect(content).not.toContain("payload:");
  });

  test("generates socket with complex nested path", async () => {
    const config: RouteConfigType = {
      name: "api.v1.organizations.departments.employees.list",
      path: "/api/v1/orgs/:orgId/depts/:deptId/employees/:empId/monitor",
      method: "GET",
      controller: UserController,
      description: "Monitor employee activity",
      isSocket: true,
      params: {
        orgId: type("string"),
        deptId: type("string"),
        empId: type("string"),
      },
    };

    await generateRouteSocket(config);

    const fileName = "ApiV1OrganizationsDepartmentsEmployeesListSocket.ts";
    const filePath = join(outputDir, fileName);

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();

    // Verify class name is properly formatted
    expect(content).toContain("export class ApiV1OrganizationsDepartmentsEmployeesListSocket");

    // Verify all params are in the URL
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.orgId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.deptId}");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: checking generated template literal
    expect(content).toContain("${params.empId}");
  });
});
