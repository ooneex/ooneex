import { VALID_ACTIONS, VALID_NAMESPACES } from "@ooneex/routing";
import { Assert, type AssertType, Validation, type ValidationResultType } from "@ooneex/validation";

const ROUTE_NAME_REGEX = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
const RESOURCE_SEGMENT_REGEX = /^[a-zA-Z0-9]+$/;

export class AssertRouteName extends Validation {
  public getConstraint(): AssertType {
    return Assert("string >= 7");
  }

  public getErrorMessage(): string | null {
    return "Route name must follow format: namespace.resource.action (e.g., 'api.users.list')";
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const routeName = data as string;

    // Check for leading or trailing whitespace
    if (routeName.trim() !== routeName) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route name format",
      };
    }

    // Check basic format (three segments separated by dots)
    if (!ROUTE_NAME_REGEX.test(routeName)) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route name format",
      };
    }

    const segments = routeName.split(".");

    // Must have exactly three segments
    if (segments.length !== 3) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route name format",
      };
    }

    const [namespace, resource, action] = segments;

    // Validate all segments are defined
    if (!namespace || !resource || !action) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route name format",
      };
    }

    // Validate namespace
    if (!VALID_NAMESPACES.includes(namespace as (typeof VALID_NAMESPACES)[number])) {
      return {
        isValid: false,
        message: `Invalid namespace '${namespace}'. Must be one of: ${VALID_NAMESPACES.join(", ")}`,
      };
    }

    // Validate resource segment (alphanumeric only)
    if (!RESOURCE_SEGMENT_REGEX.test(resource)) {
      return {
        isValid: false,
        message: `Invalid resource segment '${resource}'. Must contain only letters and numbers`,
      };
    }

    // Validate action
    if (!VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
      return {
        isValid: false,
        message: `Invalid action '${action}'. Must be one of the predefined actions`,
      };
    }

    return {
      isValid: true,
    };
  }
}
