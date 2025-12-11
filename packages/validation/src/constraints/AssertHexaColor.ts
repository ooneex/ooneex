import type { AssertType, ValidationResultType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const HEXA_COLOR_3_DIGIT_REGEX = /^#[0-9A-Fa-f]{3}$/;
const HEXA_COLOR_6_DIGIT_REGEX = /^#[0-9A-Fa-f]{6}$/;

export class AssertHexaColor extends Validation {
  public getConstraint(): AssertType {
    return Assert("string");
  }

  public getErrorMessage(): string | null {
    return "Value must be a valid hexadecimal color (e.g., #fff, #ffffff, #A1B2C3)";
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const color = data as string;

    const is3DigitHex = HEXA_COLOR_3_DIGIT_REGEX.test(color);
    const is6DigitHex = HEXA_COLOR_6_DIGIT_REGEX.test(color);

    if (!is3DigitHex && !is6DigitHex) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid hexadecimal color",
      };
    }

    return {
      isValid: true,
    };
  }
}
