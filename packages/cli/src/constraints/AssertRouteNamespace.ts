import { VALID_NAMESPACES } from "@ooneex/routing";
import { Assert, type AssertType, Validation, type ValidationResultType } from "@ooneex/validation";

export class AssertRouteNamespace extends Validation {
  public getConstraint(): AssertType {
    return Assert("string >= 3");
  }

  public getErrorMessage(): string | null {
    return `Route namespace must be one of: ${VALID_NAMESPACES.join(", ")}`;
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const namespace = data as string;

    // Check for leading or trailing whitespace
    if (namespace.trim() !== namespace) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route namespace format",
      };
    }

    // Convert to lowercase for comparison
    const lowerNamespace = namespace.toLowerCase();

    // Check if the namespace is valid
    if (!VALID_NAMESPACES.includes(lowerNamespace as (typeof VALID_NAMESPACES)[number])) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route namespace",
      };
    }

    return {
      isValid: true,
    };
  }
}
