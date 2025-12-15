import { toPascalCase } from "@ooneex/utils";
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
  if (!config.response && !config.params && !config.payload && !config.queries) {
    return "never";
  }

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
    controller: config.controller.name,
    isSocket: config.isSocket,
    parameters: extractParameterNames(config.path),
  };

  const schemas: Record<string, Record<string, unknown>> = {};

  if (config.params) {
    const paramsSchema: Record<string, unknown> = {
      type: "object",
      properties: {},
    };

    for (const [key, assert] of Object.entries(config.params)) {
      const schema = assertToJsonSchema(assert);
      // Remove $schema from the schema object
      delete schema.$schema;
      // Add required field to each property
      schema.required = true;
      (paramsSchema.properties as Record<string, unknown>)[key] = schema;
    }

    schemas.params = paramsSchema;
  }

  if (config.queries) {
    const schema = assertToJsonSchema(config.queries);
    delete schema.$schema;
    if (schema.type === "object" && schema.properties) {
      const requiredFields = (schema.required as string[]) || [];
      const properties = schema.properties as Record<string, unknown>;
      for (const key of Object.keys(properties)) {
        const propSchema = properties[key] as Record<string, unknown>;
        propSchema.required = requiredFields.includes(key);
      }
      delete schema.required;
    }
    schemas.queries = schema;
  }

  if (config.payload) {
    const schema = assertToJsonSchema(config.payload);
    delete schema.$schema;
    if (schema.type === "object" && schema.properties) {
      const requiredFields = (schema.required as string[]) || [];
      const properties = schema.properties as Record<string, unknown>;
      for (const key of Object.keys(properties)) {
        const propSchema = properties[key] as Record<string, unknown>;
        propSchema.required = requiredFields.includes(key);
      }
      delete schema.required;
    }
    schemas.payload = schema;
  }

  if (config.response) {
    const schema = assertToJsonSchema(config.response);
    delete schema.$schema;
    if (schema.type === "object" && schema.properties) {
      const requiredFields = (schema.required as string[]) || [];
      const properties = schema.properties as Record<string, unknown>;
      for (const key of Object.keys(properties)) {
        const propSchema = properties[key] as Record<string, unknown>;
        propSchema.required = requiredFields.includes(key);
      }
      delete schema.required;
    }
    schemas.response = schema;
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

/**
 * Helper function to convert queries object to URLSearchParams string
 * Generates code that constructs URLSearchParams from a queries object
 */
const buildQueryString = (queriesSource: string): string => {
  return `Object.entries(${queriesSource} || {}).reduce((params, [key, value]) => { params.append(key, String(value)); return params; }, new URLSearchParams()).toString()`;
};

export const routeConfigToFetcherString = (config: RouteConfigType): string => {
  const action = getRouteAction(config.name);
  const typeName = `${action.charAt(0).toUpperCase() + action.slice(1)}RouteConfigType`;
  const className = `${toPascalCase(config.name)}Fetcher`;
  const method = config.method.toLowerCase();

  // Generate type definition
  const typeString = routeConfigToTypeString(config);
  const isNeverType = typeString === "never";
  const typeDefinition = isNeverType ? "" : `export type ${typeName} = ${typeString}`;

  // Build config parameter type
  const configProps: string[] = [];
  const hasParams = config.params && Object.keys(config.params).length > 0;
  const hasPayload = config.payload !== undefined;
  const hasQueries = config.queries !== undefined;
  const responseType = config.response ? `${typeName}["response"]` : "never";

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
    urlExpression = `\`${urlPath}?\${${buildQueryString("config.queries")}}\``;
  }

  // Build method call based on HTTP method
  const methodsWithPayload = ["post", "put", "patch"];
  let methodCall = "";

  if (methodsWithPayload.includes(method) && hasPayload) {
    methodCall = `return await fetcher.${method}<${responseType}>(\n      ${urlExpression},\n      config.payload,\n    );`;
  } else {
    methodCall = `return await fetcher.${method}<${responseType}>(\n      ${urlExpression},\n    );`;
  }

  // Generate class
  const classDefinition = `export class ${className} {
  public async ${action}(${configType}): Promise<ResponseDataType<${responseType}>> {

    const fetcher = new Fetcher();

    ${methodCall}
  }
}`;

  const imports = `import { Fetcher } from "@ooneex/fetcher";
import type { ResponseDataType } from "@ooneex/http-response";`;

  return isNeverType ? `${imports}\n\n${classDefinition}` : `${imports}\n\n${typeDefinition}\n\n${classDefinition}`;
};

export const routeConfigToSocketString = (config: RouteConfigType): string => {
  const action = getRouteAction(config.name);
  const typeName = `${action.charAt(0).toUpperCase() + action.slice(1)}RouteConfigType`;
  const className = `${toPascalCase(config.name)}Socket`;

  // Generate type definition
  const typeString = routeConfigToTypeString(config);
  const isNeverType = typeString === "never";
  const typeDefinition = isNeverType ? "" : `export type ${typeName} = ${typeString}`;

  // Build config parameter type
  const hasParams = config.params && Object.keys(config.params).length > 0;
  const hasPayload = config.payload && Object.keys(config.payload).length > 0;
  const hasQueries = config.queries && Object.keys(config.queries).length > 0;

  // Method signature only includes params
  const configType = hasParams ? `params: ${typeName}["params"]` : "";

  // Build URL with parameters
  const urlPath = buildPathWithParams(config.path, false);
  const urlExpression = `\`${urlPath}\``;

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

  // Determine response type
  const responseType = config.response ? `${typeName}["response"]` : "never";

  // Generate class
  const classDefinition = `export class ${className} {
  public ${action}(${configType}): ISocket<${sendDataType}, ${responseType}> {
    const url = ${urlExpression};
    const socket = new Socket<${sendDataType}, ${responseType}>(url);

    socket.onMessage((response: ResponseDataType<${responseType}>) => {
      // TODO: Handle socket message event
    });

    socket.onOpen((event: Event) => {
      // TODO: Handle socket open event
    });

    socket.onClose((event: CloseEvent) => {
      // TODO: Handle socket close event
    });

    socket.onError((event: Event, response?: ResponseDataType<${responseType}>) => {
      // TODO: Handle socket error event
    });

    return socket;
  }
}`;

  const imports = `import type { ResponseDataType } from "@ooneex/http-response";
import { type ISocket, Socket } from "@ooneex/socket/client";
import type { LocaleInfoType } from "@ooneex/translation";`;

  return isNeverType ? `${imports}\n\n${classDefinition}` : `${imports}\n\n${typeDefinition}\n\n${classDefinition}`;
};

export const routeConfigToHookString = (config: RouteConfigType): string => {
  const action = getRouteAction(config.name);
  const typeName = `${action.charAt(0).toUpperCase() + action.slice(1)}RouteConfigType`;
  const hookName = `use${toPascalCase(config.name)}`;
  const method = config.method.toUpperCase();

  // Generate type definition
  const typeString = routeConfigToTypeString(config);
  const isNeverType = typeString === "never";
  const typeDefinition = isNeverType ? "" : `export type ${typeName} = ${typeString}`;

  // Determine if this is a query or mutation based on HTTP method
  const queryMethods = ["GET", "HEAD", "OPTIONS"];
  const isQuery = queryMethods.includes(method);

  const hasParams = config.params && Object.keys(config.params).length > 0;
  const hasPayload = config.payload !== undefined;
  const hasQueries = config.queries !== undefined;

  // Determine response type
  const responseType = config.response ? `${typeName}["response"]` : "never";

  if (isQuery) {
    // Generate useQuery hook
    const configProps: string[] = [];

    if (hasParams) {
      configProps.push(`params: ${typeName}["params"]`);
    }
    if (hasQueries) {
      configProps.push(`queries?: ${typeName}["queries"]`);
    }

    const configParam = configProps.length > 0 ? `config: {\n  ${configProps.join(";\n  ")};\n}` : "";

    // Build query key
    const queryKeyParts = config.name.split(".");
    const queryKeyBase = queryKeyParts.map((part) => `'${part}'`).join(", ");
    let queryKey = `[${queryKeyBase}`;

    if (hasParams && config.params) {
      const paramKeys = Object.keys(config.params);
      for (const paramKey of paramKeys) {
        queryKey += `, config.params.${paramKey}`;
      }
    }

    if (hasQueries) {
      queryKey += ", config.queries";
    }

    queryKey += "]";

    // Build URL
    // Build URL with parameters
    const urlPath = buildPathWithParams(config.path);
    let urlExpression = `\`${urlPath}\``;

    // Add query string if queries exist
    if (hasQueries) {
      urlExpression = `\`${urlPath}?\${${buildQueryString("config.queries")}}\``;
    }

    // Build fetcher call
    const fetcherMethod = method.toLowerCase();
    const fetchCall = `const fetcher = new Fetcher();
      const url = ${urlExpression};

      return await fetcher.${fetcherMethod}<${responseType}>(url);`;

    const hookDefinition = `export const ${hookName} = (${configParam}) => {
  return useQuery({
    queryKey: ${queryKey},
    queryFn: async () => {
      ${fetchCall}
    },
  });
};`;

    const imports = `import { useQuery } from '@tanstack/react-query';
import { Fetcher } from '@ooneex/fetcher';`;

    return isNeverType ? `${imports}\n\n${hookDefinition}` : `${imports}\n\n${typeDefinition}\n\n${hookDefinition}`;
  }

  // Generate useMutation hook
  const configProps: string[] = [];

  if (hasParams) {
    configProps.push(`params: ${typeName}["params"]`);
  }
  if (hasPayload) {
    configProps.push(`payload: ${typeName}["payload"]`);
  }
  if (hasQueries) {
    configProps.push(`queries?: ${typeName}["queries"]`);
  }

  const mutationConfigType =
    configProps.length > 0 ? `config: {\n    ${configProps.join(";\n    ")};\n  }` : "config?: Record<string, never>";

  // Build URL
  const urlPath = buildPathWithParams(config.path);
  let urlExpression = `\`${urlPath}\``;

  // Add query string if queries exist
  if (hasQueries) {
    urlExpression = `\`${urlPath}\${config.queries ? \`?\${${buildQueryString("config.queries")}}\` : ''}\``;
  }

  // Build fetcher call
  const methodsWithPayload = ["POST", "PUT", "PATCH"];
  const hasFetchBody = methodsWithPayload.includes(method) && hasPayload;
  const fetcherMethod = method.toLowerCase();

  let fetchCall = `const fetcher = new Fetcher();
      const url = ${urlExpression};

      `;

  if (hasFetchBody) {
    fetchCall += `return await fetcher.${fetcherMethod}<${responseType}>(url, config.payload);`;
  } else {
    fetchCall += `return await fetcher.${fetcherMethod}<${responseType}>(url);`;
  }

  const hookDefinition = `export const ${hookName} = () => {
  const mutation = useMutation({
    mutationFn: async (${mutationConfigType}) => {
      ${fetchCall}
    },
  });

  return mutation;
};`;

  const imports = `import { useMutation } from '@tanstack/react-query';
import { Fetcher } from '@ooneex/fetcher';`;

  return isNeverType ? `${imports}\n\n${hookDefinition}` : `${imports}\n\n${typeDefinition}\n\n${hookDefinition}`;
};
