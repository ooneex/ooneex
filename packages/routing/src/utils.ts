import type { RouteConfigType, ValidRoutePath } from "./types";

// Type guards and validation helpers
export const isValidRoutePath = (path: string): path is ValidRoutePath => {
  // Runtime validation
  if (!path.startsWith("/")) return false;
  if (path.includes("//")) return false;
  if (path.includes("::")) return false;
  if (path.endsWith(":")) return false;
  if (path.includes("/:")) {
    // Check for malformed parameters
    const segments = path.split("/");
    for (const segment of segments) {
      if (segment.startsWith(":") && segment.length === 1) return false;
      if (segment.includes(":") && !segment.startsWith(":")) return false;
    }
  }
  return true;
};

/**
 * Extract parameter names from a route path at runtime
 */
export const extractParameterNames = (path: string): string[] => {
  const matches = path.match(/:([^/]+)/g);
  return matches ? matches.map((match) => match.slice(1)) : [];
};

/**
 * Convert a JSON Schema type to TypeScript type string
 */
const jsonSchemaToTypeString = (schema: unknown): string => {
  if (!schema || typeof schema !== "object") return "unknown";

  const schemaObj = schema as Record<string, unknown>;

  // Handle type property
  if (schemaObj.type) {
    switch (schemaObj.type) {
      case "string":
        return "string";
      case "number":
      case "integer":
        return "number";
      case "boolean":
        return "boolean";
      case "null":
        return "null";
      case "array":
        if (schemaObj.items) {
          return `${jsonSchemaToTypeString(schemaObj.items)}[]`;
        }
        return "unknown[]";
      case "object":
        if (schemaObj.properties && typeof schemaObj.properties === "object") {
          const props: string[] = [];
          const required = Array.isArray(schemaObj.required) ? schemaObj.required : [];

          for (const [key, value] of Object.entries(schemaObj.properties)) {
            const isRequired = required.includes(key);
            const propType = jsonSchemaToTypeString(value);
            props.push(`${key}${isRequired ? "" : "?"}: ${propType}`);
          }

          return `{ ${props.join("; ")} }`;
        }
        return "Record<string, unknown>";
    }
  }

  // Handle anyOf/oneOf (union types)
  if (schemaObj.anyOf || schemaObj.oneOf) {
    const schemas = schemaObj.anyOf || schemaObj.oneOf;
    if (Array.isArray(schemas)) {
      return schemas.map((s: unknown) => jsonSchemaToTypeString(s)).join(" | ");
    }
  }

  // Handle allOf (intersection types)
  if (schemaObj.allOf && Array.isArray(schemaObj.allOf)) {
    return schemaObj.allOf.map((s: unknown) => jsonSchemaToTypeString(s)).join(" & ");
  }

  return "unknown";
};

/**
 * Convert RouteConfigType to TypeScript type string representation
 *
 * @param config - Route configuration object
 * @returns TypeScript type definition as a string
 *
 * @example
 * ```ts
 * const config = {
 *   params: {
 *     id: Assert("string"),
 *     emailId: Assert("string"),
 *   },
 *   payload: Assert({ name: "string" }),
 *   queries: Assert({ limit: "number" }),
 *   response: Assert({ success: "boolean", message: "string" }),
 * };
 *
 * const typeString = routeConfigToTypeString(config);
 * // Returns:
 * // {
 * //   response: { success: boolean; message: string };
 * //   params: { id: string; emailId: string };
 * //   payload: { name: string };
 * //   queries: { limit: number };
 * // }
 * ```
 */
export const routeConfigToTypeString = (
  config: Pick<RouteConfigType, "params" | "queries" | "payload" | "response">,
): string => {
  const typeProperties: string[] = [];

  if (config.response) {
    try {
      const constraint = "getConstraint" in config.response ? config.response.getConstraint() : config.response;
      const schema = constraint.toJsonSchema();
      let typeStr = jsonSchemaToTypeString(schema);
      if (typeStr === "unknown" || typeStr === "{  }" || typeStr === "Record<string, unknown>") {
        typeStr = "never";
      }
      typeProperties.push(`response: ${typeStr}`);
    } catch {
      typeProperties.push("response: never");
    }
  }

  if (config.params) {
    const paramProps: string[] = [];

    for (const [key, assert] of Object.entries(config.params)) {
      try {
        const constraint = "getConstraint" in assert ? assert.getConstraint() : assert;
        const schema = constraint.toJsonSchema();
        let typeStr = jsonSchemaToTypeString(schema);
        if (typeStr === "unknown" || typeStr === "{  }" || typeStr === "Record<string, unknown>") {
          typeStr = "never";
        }
        paramProps.push(`${key}: ${typeStr}`);
      } catch {
        paramProps.push(`${key}: never`);
      }
    }

    if (paramProps.length > 0) {
      const paramsType = `{ ${paramProps.join("; ")} }`;
      typeProperties.push(`params: ${paramsType}`);
    } else {
      typeProperties.push("params: never");
    }
  }

  if (config.payload) {
    try {
      const constraint = "getConstraint" in config.payload ? config.payload.getConstraint() : config.payload;
      const schema = constraint.toJsonSchema();
      let typeStr = jsonSchemaToTypeString(schema);
      if (typeStr === "unknown" || typeStr === "{  }" || typeStr === "Record<string, unknown>") {
        typeStr = "never";
      }
      typeProperties.push(`payload: ${typeStr}`);
    } catch {
      typeProperties.push("payload: never");
    }
  }

  if (config.queries) {
    try {
      const constraint = "getConstraint" in config.queries ? config.queries.getConstraint() : config.queries;
      const schema = constraint.toJsonSchema();
      let typeStr = jsonSchemaToTypeString(schema);
      if (typeStr === "unknown" || typeStr === "{  }" || typeStr === "Record<string, unknown>") {
        typeStr = "never";
      }
      typeProperties.push(`queries: ${typeStr}`);
    } catch {
      typeProperties.push("queries: never");
    }
  }

  return `{\n  ${typeProperties.join(";\n  ")};\n}`;
};

/**
 * Helper function to convert AssertType/IAssert to JSON Schema
 */
const assertToJsonSchema = (assert: unknown): Record<string, unknown> => {
  try {
    const constraint =
      assert && typeof assert === "object" && "getConstraint" in assert
        ? (assert as { getConstraint: () => { toJsonSchema: () => Record<string, unknown> } }).getConstraint()
        : (assert as { toJsonSchema: () => Record<string, unknown> });
    return constraint.toJsonSchema();
  } catch {
    return { type: "unknown" };
  }
};

/**
 * Convert RouteConfigType to JSON documentation format
 *
 * @param config - Route configuration object
 * @returns JSON documentation object with route metadata and schemas
 *
 * @example
 * ```ts
 * const config = {
 *   name: "api.users.delete",
 *   path: "/users/:id/emails/:emailId",
 *   method: "DELETE",
 *   description: "Delete a user by ID",
 *   params: {
 *     id: Assert("string"),
 *     emailId: Assert("string"),
 *   },
 *   payload: Assert({ name: "string" }),
 *   queries: Assert({ limit: "number" }),
 *   response: Assert({ success: "boolean", message: "string" }),
 *   env: [Environment.LOCAL],
 *   roles: [ERole.ADMIN],
 *   isSocket: false,
 * };
 *
 * const jsonDoc = routeConfigToJsonDoc(config);
 * // Returns:
 * // {
 * //   name: "api.users.delete",
 * //   path: "/users/:id/emails/:emailId",
 * //   method: "DELETE",
 * //   description: "Delete a user by ID",
 * //   isSocket: false,
 * //   parameters: ["id", "emailId"],
 * //   schemas: {
 * //     params: { type: "object", properties: { id: { type: "string" }, emailId: { type: "string" } } },
 * //     queries: { type: "object", properties: { limit: { type: "number" } } },
 * //     payload: { type: "object", properties: { name: { type: "string" } } },
 * //     response: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } }
 * //   },
 * //   security: {
 * //     environments: ["LOCAL"],
 * //     roles: ["ADMIN"],
 * //     allowedIPs: [],
 * //     allowedHosts: []
 * //   }
 * // }
 * ```
 */
export const routeConfigToJsonDoc = (config: RouteConfigType): Record<string, unknown> => {
  const doc: Record<string, unknown> = {
    name: config.name,
    path: config.path,
    method: config.method,
    description: config.description,
    isSocket: config.isSocket,
    parameters: extractParameterNames(config.path),
  };

  const schemas: Record<string, Record<string, unknown>> = {};

  if (config.params) {
    const paramsSchema: Record<string, unknown> = {
      type: "object",
      properties: {},
      required: [] as string[],
    };

    for (const [key, assert] of Object.entries(config.params)) {
      const schema = assertToJsonSchema(assert);
      (paramsSchema.properties as Record<string, unknown>)[key] = schema;
      (paramsSchema.required as string[]).push(key);
    }

    schemas.params = paramsSchema;
  }

  if (config.queries) {
    schemas.queries = assertToJsonSchema(config.queries);
  }

  if (config.payload) {
    schemas.payload = assertToJsonSchema(config.payload);
  }

  if (config.response) {
    schemas.response = assertToJsonSchema(config.response);
  }

  if (Object.keys(schemas).length > 0) {
    doc.schemas = schemas;
  }

  const security: Record<string, unknown> = {};

  if (config.env && config.env.length > 0) {
    security.environments = config.env;
  }

  if (config.roles && config.roles.length > 0) {
    security.roles = config.roles;
  }

  if (config.ip && config.ip.length > 0) {
    security.allowedIPs = config.ip;
  }

  if (config.host && config.host.length > 0) {
    security.allowedHosts = config.host;
  }

  if (Object.keys(security).length > 0) {
    doc.security = security;
  }

  return doc;
};

/**
 * Convert route name to PascalCase
 * Example: "api.users.delete" -> "ApiUsersDelete"
 */
const routeNameToPascalCase = (name: string): string => {
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

/**
 * Get the action part from route name
 * Example: "api.users.delete" -> "delete"
 */
const getRouteAction = (name: string): string => {
  const parts = name.split(".");
  return parts[parts.length - 1] || "";
};

/**
 * Build URL path by replacing route parameters with template literals
 * Example: "/users/:id/emails/:emailId" -> "/users/${config.params.id}/emails/${config.params.emailId}"
 */
const buildPathWithParams = (path: string, useConfigPrefix = true): string => {
  const prefix = useConfigPrefix ? "config.params" : "params";
  return path.replace(/:(\w+)/g, (_match, param) => `\${${prefix}.${param}}`);
};

export const routeConfigToFetcherString = (config: RouteConfigType): string => {
  const action = getRouteAction(config.name);
  const typeName = `${action.charAt(0).toUpperCase() + action.slice(1)}RouteConfigType`;
  const className = `${routeNameToPascalCase(config.name)}Fetcher`;
  const method = config.method.toLowerCase();

  // Generate type definition
  const typeString = routeConfigToTypeString(config);

  const typeDefinition = `export type ${typeName} = ${typeString}`;

  // Build config parameter type
  const configProps: string[] = [];
  const hasParams = config.params && Object.keys(config.params).length > 0;
  const hasPayload = config.payload !== undefined;
  const hasQueries = config.queries !== undefined;

  if (hasParams) {
    configProps.push(`params: ${typeName}["params"]`);
  }
  if (hasPayload) {
    configProps.push(`payload: ${typeName}["payload"]`);
  }
  if (hasQueries) {
    configProps.push(`queries: ${typeName}["queries"]`);
  }

  const configType = configProps.length > 0 ? `config: {\n    ${configProps.join(";\n    ")};\n  }` : "";

  // Build URL with parameters
  const urlPath = buildPathWithParams(config.path);
  let urlExpression = `\`${urlPath}\``;

  // Add query string if queries exist
  if (hasQueries) {
    urlExpression = `\`${urlPath}?\${new URLSearchParams(config.queries as Record<string, string>).toString()}\``;
  }

  // Build method call based on HTTP method
  const methodsWithPayload = ["post", "put", "patch"];
  let methodCall = "";

  if (methodsWithPayload.includes(method) && hasPayload) {
    methodCall = `return await fetcher.${method}<${typeName}["response"]>(\n      ${urlExpression},\n      config.payload,\n    );`;
  } else {
    methodCall = `return await fetcher.${method}<${typeName}["response"]>(\n      ${urlExpression},\n    );`;
  }

  // Generate class
  const classDefinition = `export class ${className} {
  constructor(private baseURL: string) {}

  public async ${action}(${configType}): Promise<ResponseDataType<${typeName}["response"]>> {
    const fetcher = new Fetcher(this.baseURL);

    ${methodCall}
  }
}`;

  const imports = `import type { ResponseDataType } from "@ooneex/http-response";
import { Fetcher } from "@ooneex/fetcher";`;

  return `${imports}\n\n${typeDefinition}\n\n${classDefinition}`;
};

export const routeConfigToSocketString = (config: RouteConfigType): string => {
  const action = getRouteAction(config.name);
  const typeName = `${action.charAt(0).toUpperCase() + action.slice(1)}RouteConfigType`;
  const className = `${routeNameToPascalCase(config.name)}Socket`;

  // Generate type definition
  const typeString = routeConfigToTypeString(config);

  const typeDefinition = `export type ${typeName} = ${typeString}`;

  // Build config parameter type
  const hasParams = config.params && Object.keys(config.params).length > 0;
  const hasPayload = config.payload && Object.keys(config.payload).length > 0;
  const hasQueries = config.queries && Object.keys(config.queries).length > 0;

  // Method signature only includes params
  const configType = hasParams ? `params: ${typeName}["params"]` : "";

  // Build URL with parameters
  const urlPath = buildPathWithParams(config.path, false);
  const urlExpression = `\`\${this.baseURL}${urlPath}\``;

  // Build SendData type for Socket
  const sendDataTypeProps: string[] = [];
  if (hasPayload) {
    sendDataTypeProps.push(`payload: ${typeName}["payload"]`);
  }
  if (hasQueries) {
    sendDataTypeProps.push(`queries: ${typeName}["queries"]`);
  }
  sendDataTypeProps.push("language?: LocaleInfoType");

  const sendDataType = sendDataTypeProps.length > 0 ? `{ ${sendDataTypeProps.join("; ")} }` : "Record<string, unknown>";

  // Generate class
  const classDefinition = `export class ${className} {
  constructor(private baseURL: string) {}

  public ${action}(${configType}): ISocket {
    const url = ${urlExpression};
    const socket = new Socket<${sendDataType}, ${typeName}["response"]>(url);

    socket.onMessage((response) => {
      // TODO: Handle socket message event
    });

    socket.onOpen((event) => {
      // TODO: Handle socket open event
    });

    socket.onClose((event) => {
      // TODO: Handle socket close event
    });

    socket.onError((event) => {
      // TODO: Handle socket error event
    });

    return socket;
  }
}`;

  const imports = `import type { LocaleInfoType } from "@ooneex/translation";
import { type ISocket, Socket } from "@ooneex/socket/client"`;

  return `${imports}\n\n${typeDefinition}\n\n${classDefinition}`;
};
