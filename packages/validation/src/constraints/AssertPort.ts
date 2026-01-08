import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

export class AssertPort extends Validation {
  public getConstraint(): AssertType {
    return Assert("1 <= number.integer <= 65535");
  }

  public getErrorMessage(): string | null {
    return "Must be a valid port number (1-65535)";
  }
}
