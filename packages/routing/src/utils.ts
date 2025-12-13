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
