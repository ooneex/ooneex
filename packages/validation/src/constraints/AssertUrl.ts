import type { AssertType, ValidationResultType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const URL_MAX_LENGTH = 2083;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .~-]*)*\/?(\?[&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

const STRICT_URL_REGEX = /^https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/;

export class AssertUrl extends Validation {
  public getConstraint(): AssertType {
    return Assert(`1 <= string <= ${URL_MAX_LENGTH}`);
  }

  public getErrorMessage(): string | null {
    return `URL must be between 1 and ${URL_MAX_LENGTH} characters and follow a valid URL format (e.g., https://example.com, http://sub.domain.co.uk/path)`;
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const url = data as string;

    // Reject specific non-http/https protocols first
    if (url.match(/^(ftp|file|mailto|telnet|ssh|gopher):/i)) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid URL format",
      };
    }

    // Reject malformed protocols
    if (url.includes("://") && !url.match(/^https?:\/\//i)) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid URL format",
      };
    }

    // Check for whitespace at start or end
    if (url.trim() !== url) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid URL format",
      };
    }

    // Check for invalid domain patterns
    if (url.includes("..") || url.startsWith(".") || url.includes("/.") || url.endsWith(".")) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid URL format",
      };
    }

    if (!URL_REGEX.test(url)) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid URL format",
      };
    }

    return {
      isValid: true,
    };
  }

  public validateStrict(data: unknown): ValidationResultType {
    const basicValidation = super.validate(data);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const url = data as string;

    if (!STRICT_URL_REGEX.test(url)) {
      return {
        isValid: false,
        message: "URL must include protocol (http:// or https://) and follow strict URL format",
      };
    }

    return {
      isValid: true,
    };
  }
}
