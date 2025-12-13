# @ooneex/routing

Type-safe routing system for Ooneex applications with powerful utilities for route configuration and type generation.

## Installation

```bash
bun add @ooneex/routing
```

## Features

- 🎯 Type-safe route definitions with path parameter extraction
- 🔒 Compile-time route validation
- 🚀 Decorator-based route registration
- 🔄 Automatic type inference from ArkType schemas
- 🛠️ Utilities for type string generation and path validation
- 🌐 Support for HTTP methods and WebSocket routes
- 📝 Built-in support for params, queries, payload, and response validation

## Quick Start

```typescript
import { Route, type ContextType } from "@ooneex/routing";
import { Assert } from "@ooneex/validation";

@Route.get("/users/:id", {
  name: "api.users.show",
  description: "Get a user by ID",
  params: {
    id: Assert("string"),
  },
  response: Assert({
    id: "string",
    name: "string",
    email: "string",
  }),
})
export class GetUserController {
  public async index(context: ContextType) {
    const { id } = context.params;
    
    // Your logic here
    return context.response.json({
      id,
      name: "John Doe",
      email: "john@example.com",
    });
  }
}
```

## Route Configuration

### Route Decorators

The package provides decorators for all HTTP methods and WebSocket connections:

- `@Route.get(path, config)`
- `@Route.post(path, config)`
- `@Route.put(path, config)`
- `@Route.patch(path, config)`
- `@Route.delete(path, config)`
- `@Route.options(path, config)`
- `@Route.head(path, config)`
- `@Route.socket(path, config)` - for WebSocket routes

### Route Configuration Options

```typescript
type RouteConfig = {
  name: RouteNameType;           // e.g., "api.users.list"
  description: string;            // Route description
  params?: Record<string, AssertType | IAssert>;  // Path parameters
  queries?: AssertType | IAssert; // Query string validation
  payload?: AssertType | IAssert; // Request body validation
  response?: AssertType | IAssert; // Response validation
  env?: Environment[];            // Allowed environments
  ip?: string[];                  // IP whitelist
  host?: string[];                // Host whitelist
  roles?: ERole[];                // Required roles
};
```

### Path Parameters

Routes support dynamic path parameters that are automatically extracted and validated:

```typescript
@Route.delete("/users/:userId/posts/:postId", {
  name: "api.users.posts.delete",
  description: "Delete a user's post",
  params: {
    userId: Assert("string"),
    postId: Assert("string"),
  },
  response: Assert({
    success: "boolean",
    message: "string",
  }),
})
export class DeleteUserPostController {
  public async index(context: ContextType) {
    const { userId, postId } = context.params;
    // Delete logic here
  }
}
```

## Utilities

### `routeConfigToTypeString(config)`

Convert a route configuration to a TypeScript type string representation. This is useful for code generation, documentation, and type visualization.

#### Parameters

- `config`: Object containing route configuration with `params`, `queries`, `payload`, and/or `response` fields

#### Returns

A formatted string representing the TypeScript type definition.

#### Example

```typescript
import { routeConfigToTypeString } from "@ooneex/routing";
import { type } from "arktype";

const config = {
  params: {
    id: type("string"),
    emailId: type("string"),
  },
  payload: type({
    name: "string",
    email: "string",
  }),
  queries: type({
    limit: "number",
    offset: "number",
  }),
  response: type({
    success: "boolean",
    message: "string",
    data: {
      id: "string",
      name: "string",
    },
  }),
};

const typeString = routeConfigToTypeString(config);
console.log(typeString);
```

**Output:**
```typescript
{
  response: { success: boolean; message: string; data: { id: string; name: string } };
  params: { id: string; emailId: string };
  payload: { name: string; email: string };
  queries: { limit: number; offset: number };
}
```

#### Use Cases

**1. Type Definition Generation**

```typescript
const typeName = "DeleteUserRouteConfig";
const typeDefinition = `export type ${typeName} = ${routeConfigToTypeString(config)}`;

// Generates:
// export type DeleteUserRouteConfig = {
//   response: { success: boolean; message: string };
//   params: { id: string; emailId: string };
//   payload: { name: string };
//   queries: { limit: number };
// }
```

**2. API Client Generation**

```typescript
// Generate typed API client methods
const routeConfig = {
  params: { userId: type("string") },
  response: type({ id: "string", name: "string" }),
};

const clientMethod = `
public async getUser(userId: string): Promise<{ id: string; name: string }> {
  return this.fetch("/users/" + userId);
}
`;
```

**3. Documentation Generation**

```typescript
// Generate API documentation with type information
const docString = `
## GET /users/:id

**Type Definition:**
\`\`\`typescript
${routeConfigToTypeString(userRouteConfig)}
\`\`\`
`;
```

### `isValidRoutePath(path)`

Validates a route path at runtime.

```typescript
import { isValidRoutePath } from "@ooneex/routing";

isValidRoutePath("/users/:id");              // true
isValidRoutePath("/users/:id/posts/:postId"); // true
isValidRoutePath("users");                    // false (must start with /)
isValidRoutePath("/users//posts");            // false (no double slashes)
isValidRoutePath("/users/:");                 // false (parameter needs name)
```

### `extractParameterNames(path)`

Extract parameter names from a route path.

```typescript
import { extractParameterNames } from "@ooneex/routing";

extractParameterNames("/users/:id");
// ["id"]

extractParameterNames("/users/:userId/posts/:postId");
// ["userId", "postId"]

extractParameterNames("/static/path");
// []
```

## Type System

### Route Path Types

The package provides compile-time validation for route paths:

```typescript
import type { RoutePathType, ExtractParameters } from "@ooneex/routing";

// Valid paths
type ValidPath = RoutePathType<"/users/:id">;
type MultiParam = RoutePathType<"/users/:userId/posts/:postId">;

// Extract parameters
type UserParams = ExtractParameters<"/users/:id">;
// Result: "id"

type PostParams = ExtractParameters<"/users/:userId/posts/:postId">;
// Result: "userId" | "postId"
```

### Route Name Types

Route names follow a strict pattern: `namespace.resource.action`

```typescript
import type { RouteNameType } from "@ooneex/routing";

// Valid route names
type ApiUserList = "api.users.list";
type ApiUserShow = "api.users.show";
type WebPostCreate = "client.posts.create";
type AdminSettingsUpdate = "admin.settings.update";
```

## Router API

### Adding Routes

```typescript
import { router } from "@ooneex/routing";

router.addRoute({
  name: "api.users.list",
  path: "/users",
  method: "GET",
  controller: UserListController,
  description: "List all users",
  isSocket: false,
});
```

### Finding Routes

```typescript
// Find by path
const routes = router.findRouteByPath("/users/:id");

// Find by name
const route = router.findRouteByName("api.users.show");

// Get all routes
const allRoutes = router.getRoutes();

// Get only HTTP routes
const httpRoutes = router.getHttpRoutes();

// Get only WebSocket routes
const socketRoutes = router.getSocketRoutes();
```

### Generating URLs

```typescript
// Generate URL from route name
const url = router.generate("api.users.show", { id: "123" });
// Result: "/users/123"

const complexUrl = router.generate("api.users.posts.show", {
  userId: "123",
  postId: "456",
});
// Result: "/users/123/posts/456"
```

## Advanced Examples

### Complex Route with All Options

```typescript
import { Route } from "@ooneex/routing";
import { Assert } from "@ooneex/validation";
import { Environment } from "@ooneex/app-env";
import { ERole } from "@ooneex/role";

@Route.post("/admin/users/:userId/permissions", {
  name: "admin.users.permissions.update",
  description: "Update user permissions (admin only)",
  params: {
    userId: Assert("string"),
  },
  payload: Assert({
    permissions: "string[]",
    expiresAt: "string.date.parse",
  }),
  queries: Assert({
    "notify?": "boolean",
  }),
  response: Assert({
    success: "boolean",
    message: "string",
    permissions: "string[]",
  }),
  env: [Environment.PRODUCTION, Environment.STAGING],
  roles: [ERole.ADMIN, ERole.SUPER_ADMIN],
})
export class UpdateUserPermissionsController {
  public async index(context: ContextType) {
    // Implementation
  }
}
```

### WebSocket Route

```typescript
@Route.socket("/chat/:roomId", {
  name: "client.chat.room",
  description: "WebSocket chat room connection",
  params: {
    roomId: Assert("string"),
  },
  queries: Assert({
    token: "string",
  }),
})
export class ChatRoomSocketController {
  public async index(context: ContextType) {
    // WebSocket handling
  }
}
```

### Optional Properties

```typescript
@Route.patch("/users/:id", {
  name: "api.users.update",
  description: "Update user profile",
  params: {
    id: Assert("string"),
  },
  payload: Assert({
    "name?": "string",
    "email?": "string.email",
    "age?": "number >= 18",
    "bio?": "string",
  }),
  response: Assert({
    success: "boolean",
    updated: "boolean",
  }),
})
export class UpdateUserController {
  public async index(context: ContextType) {
    // Update logic
  }
}
```

## Testing

```typescript
import { describe, expect, test } from "bun:test";
import { routeConfigToTypeString, extractParameterNames } from "@ooneex/routing";
import { type } from "arktype";

describe("Route utilities", () => {
  test("converts route config to type string", () => {
    const config = {
      params: { id: type("string") },
      response: type({ success: "boolean" }),
    };
    
    const result = routeConfigToTypeString(config);
    
    expect(result).toContain("params:");
    expect(result).toContain("id: string");
    expect(result).toContain("response:");
    expect(result).toContain("success: boolean");
  });

  test("extracts parameter names", () => {
    const params = extractParameterNames("/users/:id/posts/:postId");
    expect(params).toEqual(["id", "postId"]);
  });
});
```

## Best Practices

1. **Use descriptive route names** following the `namespace.resource.action` pattern
2. **Validate all inputs** using ArkType assertions for params, queries, and payload
3. **Document routes** with clear descriptions
4. **Type your responses** to ensure API consistency
5. **Use environment restrictions** for sensitive endpoints
6. **Leverage path parameter extraction** for type-safe access to URL parameters
7. **Generate types** using `routeConfigToTypeString` for API clients and documentation

## Contributing

Contributions are welcome! Please follow the project's coding standards and ensure all tests pass.

## License

MIT
