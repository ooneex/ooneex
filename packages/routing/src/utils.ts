import type { ValidRoutePath } from "./types";

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
