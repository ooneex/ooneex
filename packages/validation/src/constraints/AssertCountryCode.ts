import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

export class AssertCountryCode extends Validation {
  public getConstraint(): AssertType {
    return Assert("2 <= string <= 2 & /^[A-Z]{2}$/");
  }

  public getErrorMessage(): string | null {
    return "Country code must be a 2-character uppercase ISO 3166-1 alpha-2 code";
  }
}
