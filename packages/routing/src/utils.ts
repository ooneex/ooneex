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

// // Example usage and type tests (these would be removed in production)
// type TestPaths = {
//   valid1: RoutePathType<"/users/:id">; // ✓ Valid
//   valid2: RoutePathType<"/users/:id/bills/:billId">; // ✓ Valid
//   valid3: RoutePathType<"/static/path">; // ✓ Valid
//   valid4: RoutePathType<"/api/v1/users/:userId/posts/:postId/comments/:commentId">; // ✓ Valid

//   // These should be never (compile errors)
//   // invalid1: RoutePathType<"users/:id">; // ✗ Doesn't start with /
//   // invalid2: RoutePathType<"/users//bills">; // ✗ Double slash
//   // invalid3: RoutePathType<"/users/:id:name">; // ✗ Malformed parameter
//   // invalid4: RoutePathType<"/users/:">; // ✗ Parameter without name
// };

// type TestParameters = {
//   params1: RouteParameters<"/users/:id">; // { id: string }
//   params2: RouteParameters<"/users/:id/bills/:billId">; // { id: string; billId: string }
//   params3: RouteParameters<"/static/path">; // Record<string, never>
//   params4: RouteParameters<"/api/v1/users/:userId/posts/:postId/comments/:commentId">; // { userId: string; postId: string; commentId: string }
// };

// type TestHasParameters = {
//   has1: HasParameters<"/users/:id">; // true
//   has2: HasParameters<"/static/path">; // false
// };

// type TestParameterCount = {
//   count1: ParameterCount<"/users/:id">; // 1
//   count2: ParameterCount<"/users/:id/bills/:billId">; // 2
//   count3: ParameterCount<"/static/path">; // 0
// };
