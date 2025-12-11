import type { AssertType, ValidationResultType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const CHAT_QUERY_MIN_LENGTH = 1;
const CHAT_QUERY_MAX_LENGTH = 2000;
const CHAT_QUERY_FORBIDDEN_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<\/?[a-zA-Z][^>]*>/g,
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
];

export class AssertChatQuery extends Validation {
  public getConstraint(): AssertType {
    return Assert(`${CHAT_QUERY_MIN_LENGTH} <= string <= ${CHAT_QUERY_MAX_LENGTH}`);
  }

  public getErrorMessage(): string | null {
    return "Chat query must be between 1 and 2000 characters and cannot contain HTML tags, scripts, or unsafe protocols";
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const query = data as string;

    for (const pattern of CHAT_QUERY_FORBIDDEN_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(query)) {
        return {
          isValid: false,
          message: this.getErrorMessage() || "Invalid chat query",
        };
      }
    }

    return {
      isValid: true,
    };
  }
}
