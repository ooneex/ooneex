import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

export class AssertFirstName extends Validation {
  public getConstraint(): AssertType {
    return Assert("1 <= string <= 50 & /^[a-zA-Z\\s'-]+$/");
  }

  public getErrorMessage(): string | null {
    return "First name must be between 1 and 50 characters and contain only letters, spaces, hyphens, and apostrophes";
  }
}
