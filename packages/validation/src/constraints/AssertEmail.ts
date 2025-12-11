import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

export class AssertEmail extends Validation {
  public getConstraint(): AssertType {
    return Assert("string.email");
  }

  public getErrorMessage(): string | null {
    return "Must be a valid email address";
  }
}
