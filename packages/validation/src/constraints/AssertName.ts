import type { AssertType, ValidationResultType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 50;
const NAME_REGEX = /^[a-zA-ZÀ-ÿĀ-žА-я\u4e00-\u9fff\s\-'0-9.]+$/;

export class AssertName extends Validation {
  public getConstraint(): AssertType {
    return Assert(`${NAME_MIN_LENGTH} <= string <= ${NAME_MAX_LENGTH}`);
  }

  public getErrorMessage(): string | null {
    return "Name must be between 1 and 50 characters and contain only letters, numbers, spaces, hyphens, apostrophes, and periods";
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const name = data as string;

    // Check for leading or trailing whitespace
    if (name.trim() !== name) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid name format",
      };
    }

    if (!NAME_REGEX.test(name)) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid name format",
      };
    }

    // Check for valid period usage (only allowed when followed by space like "St. John")
    if (name.includes(".") && !name.match(/\.\s/)) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid name format",
      };
    }

    return {
      isValid: true,
    };
  }
}
