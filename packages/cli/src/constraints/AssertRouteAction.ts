import { VALID_ACTIONS } from "@ooneex/routing";
import { Assert, type AssertType, Validation, type ValidationResultType } from "@ooneex/validation";

export class AssertRouteAction extends Validation {
  public getConstraint(): AssertType {
    return Assert("string >= 2");
  }

  public getErrorMessage(): string | null {
    return `Route action must be one of the valid actions: ${VALID_ACTIONS.slice(0, 10).join(", ")}...`;
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const action = data as string;

    // Check for leading or trailing whitespace
    if (action.trim() !== action) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route action format",
      };
    }

    // Convert to lowercase for comparison
    const lowerAction = action.toLowerCase();

    // Check if the action is valid
    if (!VALID_ACTIONS.includes(lowerAction as (typeof VALID_ACTIONS)[number])) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid route action",
      };
    }

    return {
      isValid: true,
    };
  }
}
